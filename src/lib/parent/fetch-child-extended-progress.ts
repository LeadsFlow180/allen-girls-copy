import type { SupabaseClient } from "@supabase/supabase-js";

import type { ParentDashboardChildExtended, ParentDashboardQuiz } from "@/lib/parent/parent-dashboard-types";
import { playbackRowToParentSlides } from "@/lib/parent/playback-to-parent-slides";
import { isSlideMissionComplete } from "@/lib/parent/parent-progress-labels";

function parseQuizRow(row: {
  submitted_at: string;
  classroom_id: string;
  scene_id: string | null;
  ladder_step: string | null;
  section_id?: number | null;
  unit_index?: number | null;
  quiz: unknown;
}): ParentDashboardQuiz {
  const q = (row.quiz ?? {}) as Record<string, unknown>;
  const sectionId = Number(row.section_id);
  const unitIndex = Number(row.unit_index);
  return {
    submittedAt: row.submitted_at,
    classroomId: row.classroom_id,
    sceneId: row.scene_id,
    ladderStep: row.ladder_step,
    sectionId: Number.isFinite(sectionId) ? sectionId : null,
    unitIndex: Number.isFinite(unitIndex) ? unitIndex : null,
    percent: Math.round(Number(q.percent ?? 0)),
    score: Number(q.score ?? 0),
    totalPoints: Number(q.totalPoints ?? 0),
    correctCount: Number(q.correctCount ?? 0),
    questionCount: Math.max(1, Number(q.questionCount ?? 1)),
  };
}

function parseClaimedList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

/** Loads slides, quizzes, quests, missions for linked students (service role or parent RLS). */
export async function fetchExtendedProgressByStudent(
  db: SupabaseClient,
  studentIds: string[],
): Promise<Map<string, ParentDashboardChildExtended>> {
  const result = new Map<string, ParentDashboardChildExtended>();

  if (studentIds.length === 0) return result;

  const emptyExtended = (): ParentDashboardChildExtended => ({
    slides: [],
    quizzes: [],
    questDays: [],
    missions: [],
    modulesCompleted: [],
    streak: null,
    checkpoints: [],
    summary: {
      slideSessions: 0,
      completedSlideSessions: 0,
      missionsCompleted: 0,
      missionsInProgress: 0,
      latestSlideScene: null,
      latestSlideTotal: null,
      latestMissionIndex: null,
      quizCount: 0,
      avgQuizPercent: null,
      questsClaimedTotal: 0,
      skillsPassed: 0,
      modulesCleared: 0,
    },
  });

  for (const id of studentIds) {
    result.set(id, emptyExtended());
  }

  const [
    playbackRes,
    quizRes,
    questRes,
    skillRes,
    moduleRes,
    streakRes,
    checkpointRes,
  ] = await Promise.all([
    db
      .from("learn_playback_progress")
      .select(
        "learner_id, classroom_id, current_scene_id, scene_index, action_index, status, playback_completed, updated_at, details",
      )
      .in("learner_id", studentIds)
      .order("updated_at", { ascending: false }),
    db
      .from("learn_quiz_submissions")
      .select(
        "learner_id, classroom_id, scene_id, ladder_step, section_id, unit_index, quiz, submitted_at",
      )
      .in("learner_id", studentIds)
      .order("submitted_at", { ascending: false })
      .limit(80),
    db
      .from("learn_quest_progress")
      .select("learner_id, quest_date, claimed")
      .in("learner_id", studentIds)
      .order("quest_date", { ascending: false })
      .limit(40),
    db
      .from("skill_completions")
      .select(
        "student_user_id, skill_id, module_id, world_slug, subject_category, gate_type, score, points_awarded, completed_at",
      )
      .in("student_user_id", studentIds)
      .order("completed_at", { ascending: false })
      .limit(50),
    db
      .from("module_completions")
      .select("student_user_id, module_id, world_slug, skills_count, total_points, completed_at")
      .in("student_user_id", studentIds)
      .order("completed_at", { ascending: false })
      .limit(30),
    db
      .from("daily_streaks")
      .select("student_user_id, current_streak, longest_streak, last_active_date")
      .in("student_user_id", studentIds),
    db
      .from("mission_checkpoints")
      .select("student_user_id, mission_id, checkpoint_type, gate_type, created_at")
      .in("student_user_id", studentIds)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (process.env.NODE_ENV !== "production") {
    for (const err of [
      playbackRes.error,
      quizRes.error,
      questRes.error,
      skillRes.error,
      moduleRes.error,
      streakRes.error,
      checkpointRes.error,
    ]) {
      if (err) console.error("[fetchExtendedProgressByStudent]", err.message);
    }
  }

  const playbackRows = playbackRes.data;
  const quizRows = quizRes.data;
  const questRows = questRes.data;
  const skillRows = skillRes.data;
  const moduleRows = moduleRes.data;
  const streakRows = streakRes.data;
  const checkpointRows = checkpointRes.data;

  for (const row of playbackRows ?? []) {
    const sid = row.learner_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.slides.push(
      ...playbackRowToParentSlides({
        classroom_id: row.classroom_id as string,
        current_scene_id: row.current_scene_id as string | null,
        scene_index: row.scene_index as number | null,
        action_index: row.action_index as number | null,
        status: row.status as string | null,
        playback_completed: row.playback_completed as boolean | null,
        updated_at: row.updated_at as string,
        details: row.details,
      }),
    );
  }

  for (const [, bucket] of result) {
    bucket.slides.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  for (const row of quizRows ?? []) {
    const sid = row.learner_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.quizzes.push(parseQuizRow(row as Parameters<typeof parseQuizRow>[0]));
  }

  for (const row of questRows ?? []) {
    const sid = row.learner_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    const claimed = (row.claimed ?? {}) as Record<string, unknown>;
    bucket.questDays.push({
      questDate: row.quest_date as string,
      claimedDaily: parseClaimedList(claimed.daily),
      claimedWeekly: parseClaimedList(claimed.weekly),
      claimedMonthly: parseClaimedList(claimed.monthly),
    });
  }

  for (const row of skillRows ?? []) {
    const sid = row.student_user_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.missions.push({
      skillId: row.skill_id as string,
      moduleId: row.module_id as string,
      worldSlug: row.world_slug as string,
      subjectCategory: row.subject_category as string,
      gateType: row.gate_type as string,
      score: row.score as number,
      pointsAwarded: row.points_awarded as number,
      completedAt: row.completed_at as string,
    });
  }

  for (const row of moduleRows ?? []) {
    const sid = row.student_user_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.modulesCompleted.push({
      moduleId: row.module_id as string,
      worldSlug: row.world_slug as string,
      skillsCount: row.skills_count as number,
      totalPoints: row.total_points as number,
      completedAt: row.completed_at as string,
    });
  }

  for (const row of streakRows ?? []) {
    const sid = row.student_user_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.streak = {
      current: row.current_streak as number,
      longest: row.longest_streak as number,
      lastActiveDate: (row.last_active_date as string | null) ?? null,
    };
  }

  for (const row of checkpointRows ?? []) {
    const sid = row.student_user_id as string;
    const bucket = result.get(sid);
    if (!bucket) continue;
    bucket.checkpoints.push({
      missionId: row.mission_id as string,
      checkpointType: row.checkpoint_type as string,
      gateType: (row.gate_type as string | null) ?? null,
      createdAt: row.created_at as string,
    });
  }

  for (const [sid, bucket] of result) {
    const quizPercents = bucket.quizzes.map((q) => q.percent);
    const questsClaimedTotal = bucket.questDays.reduce(
      (n, d) => n + d.claimedDaily.length + d.claimedWeekly.length + d.claimedMonthly.length,
      0,
    );
    const latest = bucket.slides[0] ?? null;
    const missionsCompleted = bucket.slides.filter((s) => isSlideMissionComplete(s)).length;
    const missionsInProgress = bucket.slides.filter((s) => !isSlideMissionComplete(s)).length;

    bucket.summary = {
      slideSessions: bucket.slides.length,
      completedSlideSessions: missionsCompleted,
      missionsCompleted,
      missionsInProgress,
      latestSlideScene: latest ? latest.sceneIndex + 1 : null,
      latestSlideTotal: latest?.totalSlides ?? null,
      latestMissionIndex:
        latest?.ladderStepIndex != null ? latest.ladderStepIndex + 1 : null,
      quizCount: bucket.quizzes.length,
      avgQuizPercent:
        quizPercents.length > 0
          ? Math.round(quizPercents.reduce((a, b) => a + b, 0) / quizPercents.length)
          : null,
      questsClaimedTotal,
      skillsPassed: bucket.missions.length,
      modulesCleared: bucket.modulesCompleted.length,
    };
    result.set(sid, bucket);
  }

  return result;
}
