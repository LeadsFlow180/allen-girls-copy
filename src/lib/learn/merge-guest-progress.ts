import type { SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_LEARN_CLASSROOM_ID, DEFAULT_UNITS_PER_SECTION } from "@/lib/learn/constants";
import {
  countCompletedStepsInDetails,
  isStepMissionComplete,
  parseStepProgressMap,
  type StepPlaybackState,
  type StepProgressMap,
} from "@/lib/learn/playback-step-progress";

type PlaybackRow = {
  classroom_id: string;
  current_scene_id: string | null;
  scene_index: number;
  action_index: number;
  consumed_discussions: unknown;
  playback_completed: boolean;
  status: string;
  updated_at: string;
  details: unknown;
  db_section_id?: number | null;
  db_unit_id?: number | null;
};

function parseDetailsRecord(details: unknown): Record<string, unknown> {
  if (!details) return {};
  if (typeof details === "string") {
    try {
      return parseDetailsRecord(JSON.parse(details));
    } catch {
      return {};
    }
  }
  if (typeof details === "object" && !Array.isArray(details)) {
    return { ...(details as Record<string, unknown>) };
  }
  return {};
}

function pickRicherStepState(
  existing: StepPlaybackState | undefined,
  incoming: StepPlaybackState,
): StepPlaybackState {
  if (!existing) return incoming;
  if (isStepMissionComplete(incoming) && !isStepMissionComplete(existing)) return incoming;
  if (!isStepMissionComplete(incoming) && isStepMissionComplete(existing)) return existing;
  const inScene = incoming.sceneIndex ?? 0;
  const exScene = existing.sceneIndex ?? 0;
  if (inScene > exScene) return incoming;
  if (inScene < exScene) return existing;
  const inAt = incoming.updatedAt ?? "";
  const exAt = existing.updatedAt ?? "";
  return inAt >= exAt ? incoming : existing;
}

function mergeStepProgressMaps(
  learner: StepProgressMap,
  guest: StepProgressMap,
): StepProgressMap {
  const merged: StepProgressMap = { ...learner };
  for (const [key, guestState] of Object.entries(guest)) {
    merged[key] = pickRicherStepState(merged[key], guestState);
  }
  return merged;
}

function mergePlaybackDetails(
  learnerDetails: unknown,
  guestDetails: unknown,
): Record<string, unknown> {
  const learner = parseDetailsRecord(learnerDetails);
  const guest = parseDetailsRecord(guestDetails);

  const mergedSteps = mergeStepProgressMaps(
    parseStepProgressMap(learner),
    parseStepProgressMap(guest),
  );

  const guestCtx = guest.activeContext as Record<string, unknown> | undefined;
  const learnerCtx = learner.activeContext as Record<string, unknown> | undefined;

  const guestCompleted = Object.values(parseStepProgressMap(guest)).filter((s) =>
    isStepMissionComplete(s),
  ).length;
  const learnerCompleted = Object.values(parseStepProgressMap(learner)).filter((s) =>
    isStepMissionComplete(s),
  ).length;

  const activeContext =
    guestCompleted >= learnerCompleted && guestCtx ? guestCtx : learnerCtx ?? guestCtx;

  const guestQuiz = guest.lastQuiz as Record<string, unknown> | undefined;
  const learnerQuiz = learner.lastQuiz as Record<string, unknown> | undefined;
  const guestQuizAt =
    typeof guestQuiz?.recordedAt === "string" ? guestQuiz.recordedAt : guestQuiz?.submittedAt;
  const learnerQuizAt =
    typeof learnerQuiz?.recordedAt === "string"
      ? learnerQuiz.recordedAt
      : learnerQuiz?.submittedAt;
  const lastQuiz =
    guestQuizAt && learnerQuizAt
      ? guestQuizAt >= learnerQuizAt
        ? guestQuiz
        : learnerQuiz
      : guestQuiz ?? learnerQuiz;

  return {
    ...learner,
    ...guest,
    stepProgress: mergedSteps,
    activeContext: activeContext ?? guest.activeContext ?? learner.activeContext,
    lastQuiz: lastQuiz ?? guest.lastQuiz ?? learner.lastQuiz,
    sectionId: guest.sectionId ?? learner.sectionId,
    unitIndex: guest.unitIndex ?? learner.unitIndex,
    ladderStep: guest.ladderStep ?? learner.ladderStep,
    ladderStepIndex: guest.ladderStepIndex ?? learner.ladderStepIndex,
    completedLadderSteps: Math.max(
      Number(guest.completedLadderSteps ?? 0),
      Number(learner.completedLadderSteps ?? 0),
    ),
    dbSectionId: guest.dbSectionId ?? learner.dbSectionId,
    dbUnitId: guest.dbUnitId ?? learner.dbUnitId,
    totalSlides: guest.totalSlides ?? learner.totalSlides,
  };
}

function pickMergedTopLevelFields(
  learner: PlaybackRow,
  guest: PlaybackRow,
  mergedDetails: Record<string, unknown>,
): Partial<PlaybackRow> {
  const guestSteps = parseStepProgressMap(guest.details);
  const learnerSteps = parseStepProgressMap(learner.details);
  const mergedSteps = parseStepProgressMap(mergedDetails);
  const guestCount = Object.values(guestSteps).filter((s) => isStepMissionComplete(s)).length;
  const learnerCount = Object.values(learnerSteps).filter((s) => isStepMissionComplete(s)).length;
  const useGuest = guestCount >= learnerCount;

  const ctx = mergedDetails.activeContext as Record<string, unknown> | undefined;
  const dbUnitId =
    typeof ctx?.dbUnitId === "number"
      ? ctx.dbUnitId
      : useGuest
        ? guest.db_unit_id
        : learner.db_unit_id;
  const dbSectionId =
    typeof ctx?.sectionId === "number"
      ? ctx.sectionId
      : useGuest
        ? guest.db_section_id
        : learner.db_section_id;

  const source = useGuest ? guest : learner;

  return {
    current_scene_id: source.current_scene_id,
    scene_index: source.scene_index,
    action_index: source.action_index,
    consumed_discussions: source.consumed_discussions,
    playback_completed: source.playback_completed || learner.playback_completed,
    status:
      source.status === "complete" || learner.status === "complete"
        ? "complete"
        : source.status,
    updated_at:
      source.updated_at >= learner.updated_at ? source.updated_at : learner.updated_at,
    details: mergedDetails,
    db_section_id: dbSectionId ?? null,
    db_unit_id: dbUnitId ?? null,
  };
}

async function mergeGuestPlaybackRowIntoLearner(
  admin: SupabaseClient,
  learnerId: string,
  guestRow: PlaybackRow,
  guestSessionId: string,
): Promise<boolean> {
  const classroomId = guestRow.classroom_id;

  const { data: learnerRow } = await admin
    .from("learn_playback_progress")
    .select(
      "classroom_id, current_scene_id, scene_index, action_index, consumed_discussions, playback_completed, status, updated_at, details, db_section_id, db_unit_id",
    )
    .eq("learner_id", learnerId)
    .eq("classroom_id", classroomId)
    .maybeSingle();

  if (learnerRow) {
    const mergedDetails = mergePlaybackDetails(learnerRow.details, guestRow.details);
    const patch = pickMergedTopLevelFields(
      learnerRow as PlaybackRow,
      guestRow,
      mergedDetails,
    );

    const { error: updateError } = await admin
      .from("learn_playback_progress")
      .update(patch)
      .eq("learner_id", learnerId)
      .eq("classroom_id", classroomId);

    if (updateError) return false;

    await admin
      .from("learn_playback_progress")
      .delete()
      .eq("guest_session_id", guestSessionId)
      .eq("classroom_id", classroomId);

    return true;
  }

  const { error } = await admin
    .from("learn_playback_progress")
    .update({
      learner_id: learnerId,
      guest_session_id: null,
      current_scene_id: guestRow.current_scene_id,
      scene_index: guestRow.scene_index,
      action_index: guestRow.action_index,
      consumed_discussions: guestRow.consumed_discussions,
      playback_completed: guestRow.playback_completed,
      status: guestRow.status,
      details: guestRow.details,
      updated_at: guestRow.updated_at,
      db_section_id: guestRow.db_section_id ?? null,
      db_unit_id: guestRow.db_unit_id ?? null,
    })
    .eq("guest_session_id", guestSessionId)
    .eq("classroom_id", classroomId);

  return !error;
}

/**
 * Merges guest cloud progress into a signed-in learner (unions stepProgress; never drops guest work).
 */
export async function mergeGuestProgressIntoLearner(
  admin: SupabaseClient,
  learnerId: string,
  guestSessionId: string,
): Promise<{ ok: boolean; playbackMerged: number; quizzesMerged: number; questsMerged: number }> {
  let playbackMerged = 0;
  let quizzesMerged = 0;
  let questsMerged = 0;

  const { data: guestPlayback } = await admin
    .from("learn_playback_progress")
    .select(
      "classroom_id, current_scene_id, scene_index, action_index, consumed_discussions, playback_completed, status, updated_at, details, db_section_id, db_unit_id",
    )
    .eq("guest_session_id", guestSessionId);

  for (const row of guestPlayback ?? []) {
    const ok = await mergeGuestPlaybackRowIntoLearner(
      admin,
      learnerId,
      row as PlaybackRow,
      guestSessionId,
    );
    if (ok) playbackMerged += 1;
  }

  const { data: guestQuizzes } = await admin
    .from("learn_quiz_submissions")
    .select("id")
    .eq("guest_session_id", guestSessionId)
    .is("learner_id", null);

  if (guestQuizzes?.length) {
    const { error } = await admin
      .from("learn_quiz_submissions")
      .update({ learner_id: learnerId, guest_session_id: null })
      .eq("guest_session_id", guestSessionId)
      .is("learner_id", null);

    if (!error) quizzesMerged = guestQuizzes.length;
  }

  const { data: guestQuests } = await admin
    .from("learn_quest_progress")
    .select("id, classroom_id, quest_date, claimed")
    .eq("guest_session_id", guestSessionId)
    .is("learner_id", null);

  for (const row of guestQuests ?? []) {
    const { data: existing } = await admin
      .from("learn_quest_progress")
      .select("id, claimed")
      .eq("learner_id", learnerId)
      .eq("classroom_id", row.classroom_id as string)
      .eq("quest_date", row.quest_date as string)
      .maybeSingle();

    if (existing) {
      await admin.from("learn_quest_progress").delete().eq("id", row.id as string);
      continue;
    }

    const { error } = await admin
      .from("learn_quest_progress")
      .update({ learner_id: learnerId, guest_session_id: null })
      .eq("id", row.id as string);

    if (!error) questsMerged += 1;
  }

  return { ok: true, playbackMerged, quizzesMerged, questsMerged };
}

/**
 * When a learner row is sparse, merge the guest row with the most completed steps (same classroom).
 * Fixes accounts like Maya where real progress stayed on an old guest_session_id.
 */
export async function mergeRichestGuestPlaybackForLearner(
  admin: SupabaseClient,
  learnerId: string,
  classroomId: string = DEFAULT_LEARN_CLASSROOM_ID,
): Promise<{ mergedGuestId: string | null; playbackMerged: number }> {
  const { data: learnerRow } = await admin
    .from("learn_playback_progress")
    .select("details")
    .eq("learner_id", learnerId)
    .eq("classroom_id", classroomId)
    .maybeSingle();

  const learnerCount = countCompletedStepsInDetails(
    learnerRow?.details,
    1,
    DEFAULT_UNITS_PER_SECTION,
  );

  const { data: guestRows } = await admin
    .from("learn_playback_progress")
    .select("guest_session_id, details")
    .eq("classroom_id", classroomId)
    .not("guest_session_id", "is", null)
    .is("learner_id", null);

  let bestGuestId: string | null = null;
  let bestCount = 0;

  for (const row of guestRows ?? []) {
    const guestId = row.guest_session_id as string | null;
    if (!guestId) continue;
    const count = countCompletedStepsInDetails(row.details, 1, DEFAULT_UNITS_PER_SECTION);
    if (count > bestCount) {
      bestCount = count;
      bestGuestId = guestId;
    }
  }

  // Merge when guest has strictly more completed steps, or learner has none but guest does.
  if (!bestGuestId || bestCount <= learnerCount) {
    return { mergedGuestId: null, playbackMerged: 0 };
  }

  const result = await mergeGuestProgressIntoLearner(admin, learnerId, bestGuestId);
  return {
    mergedGuestId: bestGuestId,
    playbackMerged: result.playbackMerged,
  };
}

/**
 * Union every orphan guest row for this classroom into the learner row (details.stepProgress JSONB).
 * One learner + one classroom = one DB row after this runs.
 */
export async function mergeAllGuestPlaybackForLearner(
  admin: SupabaseClient,
  learnerId: string,
  classroomId: string = DEFAULT_LEARN_CLASSROOM_ID,
): Promise<{ playbackMerged: number; mergedGuestIds: string[] }> {
  const { data: guestRows } = await admin
    .from("learn_playback_progress")
    .select("guest_session_id")
    .eq("classroom_id", classroomId)
    .not("guest_session_id", "is", null)
    .is("learner_id", null);

  const mergedGuestIds: string[] = [];
  let playbackMerged = 0;

  for (const row of guestRows ?? []) {
    const guestId = row.guest_session_id as string | null;
    if (!guestId) continue;
    const result = await mergeGuestProgressIntoLearner(admin, learnerId, guestId);
    playbackMerged += result.playbackMerged;
    if (result.playbackMerged > 0) mergedGuestIds.push(guestId);
  }

  return { playbackMerged, mergedGuestIds };
}
