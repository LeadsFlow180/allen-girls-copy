/**
 * Games dashboard data — GAME-MASTER-SPEC §8.
 * Reads game_sessions + game-sourced skill_attempts for a set of students and
 * returns a per-student summary the parent & teacher dashboards render.
 *
 * SAFE BEFORE MIGRATION 024: if the tables don't exist yet (or any query
 * errors), every student just gets an empty summary — the dashboards keep
 * working and simply show "no game activity yet."
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { getGameById } from "@/data/games/catalog";

export type GamePerGameStat = {
  gameSlug: string;
  gameTitle: string;
  gameClass: "academic" | "arcade";
  sessions: number;
  playSeconds: number;
  questionsAsked: number;
  questionsCorrect: number;
  pointsEarned: number;
};

export type GameSkillStat = {
  skillId: string;
  accuracyPercent: number;
  attempts: number;
};

export type StudentGamesSummary = {
  totalPlaySeconds: number;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  totalGamePoints: number;
  accuracyPercent: number | null;
  perGame: GamePerGameStat[];
  strongestSkill: GameSkillStat | null;
  weakestSkill: GameSkillStat | null;
};

export function emptyGamesSummary(): StudentGamesSummary {
  return {
    totalPlaySeconds: 0,
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalGamePoints: 0,
    accuracyPercent: null,
    perGame: [],
    strongestSkill: null,
    weakestSkill: null,
  };
}

type SessionRow = {
  student_user_id: string;
  game_slug: string;
  game_class: string;
  duration_seconds: number | null;
  questions_asked: number | null;
  questions_correct: number | null;
  points_awarded: number | null;
};

type AttemptRow = {
  student_user_id: string;
  skill_id: string;
  correct: boolean;
};

export async function fetchGamesSummaryByStudent(
  db: SupabaseClient,
  studentIds: string[],
): Promise<Map<string, StudentGamesSummary>> {
  const result = new Map<string, StudentGamesSummary>();
  for (const id of studentIds) result.set(id, emptyGamesSummary());
  if (studentIds.length === 0) return result;

  const [sessionsRes, attemptsRes] = await Promise.all([
    db
      .from("game_sessions")
      .select(
        "student_user_id, game_slug, game_class, duration_seconds, questions_asked, questions_correct, points_awarded",
      )
      .in("student_user_id", studentIds),
    db
      .from("skill_attempts")
      .select("student_user_id, skill_id, correct")
      .eq("source", "game")
      .in("student_user_id", studentIds),
  ]);

  // Tables not migrated yet (or RLS blocked) → return the empty summaries.
  if (sessionsRes.error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[fetchGamesSummaryByStudent] game_sessions unavailable:", sessionsRes.error.message);
    }
    return result;
  }

  // Per-game tallies from sessions
  const perGameByStudent = new Map<string, Map<string, GamePerGameStat>>();
  for (const id of studentIds) perGameByStudent.set(id, new Map());

  for (const row of (sessionsRes.data ?? []) as SessionRow[]) {
    const summary = result.get(row.student_user_id);
    const perGame = perGameByStudent.get(row.student_user_id);
    if (!summary || !perGame) continue;

    summary.totalSessions += 1;
    summary.totalPlaySeconds += row.duration_seconds ?? 0;
    summary.totalQuestions += row.questions_asked ?? 0;
    summary.totalCorrect += row.questions_correct ?? 0;
    summary.totalGamePoints += row.points_awarded ?? 0;

    const existing = perGame.get(row.game_slug);
    const game = getGameById(row.game_slug);
    const entry: GamePerGameStat = existing ?? {
      gameSlug: row.game_slug,
      gameTitle: game?.title ?? row.game_slug,
      gameClass: (row.game_class === "academic" ? "academic" : "arcade"),
      sessions: 0,
      playSeconds: 0,
      questionsAsked: 0,
      questionsCorrect: 0,
      pointsEarned: 0,
    };
    entry.sessions += 1;
    entry.playSeconds += row.duration_seconds ?? 0;
    entry.questionsAsked += row.questions_asked ?? 0;
    entry.questionsCorrect += row.questions_correct ?? 0;
    entry.pointsEarned += row.points_awarded ?? 0;
    perGame.set(row.game_slug, entry);
  }

  // Per-skill accuracy from attempts (for strongest/weakest)
  if (!attemptsRes.error) {
    const skillTally = new Map<string, Map<string, { total: number; correct: number }>>();
    for (const id of studentIds) skillTally.set(id, new Map());

    for (const row of (attemptsRes.data ?? []) as AttemptRow[]) {
      const perSkill = skillTally.get(row.student_user_id);
      if (!perSkill) continue;
      const t = perSkill.get(row.skill_id) ?? { total: 0, correct: 0 };
      t.total += 1;
      if (row.correct) t.correct += 1;
      perSkill.set(row.skill_id, t);
    }

    for (const [sid, perSkill] of skillTally) {
      const summary = result.get(sid);
      if (!summary) continue;
      const stats: GameSkillStat[] = [...perSkill.entries()].map(([skillId, t]) => ({
        skillId,
        attempts: t.total,
        accuracyPercent: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
      }));
      if (stats.length > 0) {
        const sorted = [...stats].sort((a, b) => b.accuracyPercent - a.accuracyPercent);
        summary.strongestSkill = sorted[0];
        summary.weakestSkill = sorted[sorted.length - 1];
      }
    }
  }

  // Finalize per-game lists + accuracy
  for (const [sid, summary] of result) {
    const perGame = perGameByStudent.get(sid);
    summary.perGame = perGame
      ? [...perGame.values()].sort((a, b) => b.playSeconds - a.playSeconds)
      : [];
    summary.accuracyPercent =
      summary.totalQuestions > 0
        ? Math.round((summary.totalCorrect / summary.totalQuestions) * 100)
        : null;
  }

  return result;
}
