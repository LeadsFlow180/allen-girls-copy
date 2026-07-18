/**
 * Mastery engine — PROGRESSION-SPEC §7–8.
 * Server-side only. Recalculates a student's per-skill mastery state from
 * their recent skill_attempts rows and writes student_skill_mastery.
 *
 * Mastery = Accuracy×0.45 + Independence×0.25 + Consistency×0.20 + Retention×0.10
 * Deterministic rules over stored data — no AI.
 */
import type { SupabaseClient } from "@supabase/ssr";

import type { Band } from "@/data/lms/curriculum/content-bank/types";

/** Recency weights for the last 10 attempts, oldest → newest (spec §7.1). */
const RECENCY_WEIGHTS = [0.05, 0.05, 0.07, 0.07, 0.08, 0.1, 0.12, 0.13, 0.15, 0.18];

/** Independence credit per outcome (spec §7.2). */
function independenceCredit(correct: boolean, attemptNumber: number, hintLevel: number): number {
  if (!correct) return 0;
  if (attemptNumber <= 1 && hintLevel === 0) return 100;
  if (hintLevel <= 1) return 70;
  return 40;
}

type AttemptRow = {
  correct: boolean;
  attempt_number: number;
  hint_level: number;
  question_type: string | null;
  source: string;
  session_id: string | null;
  created_at: string;
};

export type MasteryState = {
  currentBand: Band;
  status: string;
  masteryScore: number;
  accuracyScore: number;
  independenceScore: number;
  consistencyScore: number;
  retentionScore: number;
  interactionCount: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Compute all four sub-scores + mastery from attempt history (newest last). */
export function computeMastery(attempts: AttemptRow[], previousBand: Band): MasteryState {
  const count = attempts.length;

  // Accuracy: recency-weighted over the last 10
  const recent = attempts.slice(-10);
  const weights = RECENCY_WEIGHTS.slice(RECENCY_WEIGHTS.length - recent.length);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const accuracy =
    recent.length === 0
      ? 0
      : (recent.reduce((sum, a, i) => sum + (a.correct ? weights[i] : 0), 0) / weightSum) * 100;

  // Independence: average credit over the last 10
  const independence =
    recent.length === 0
      ? 0
      : recent.reduce((sum, a) => sum + independenceCredit(a.correct, a.attempt_number, a.hint_level), 0) /
        recent.length;

  // Consistency: needs volume + separate sessions + different formats (spec §7.3)
  const sessions = new Set(attempts.map((a) => a.session_id ?? a.created_at.slice(0, 10)));
  const formats = new Set(attempts.map((a) => a.question_type ?? "unknown"));
  const volumeScore = Math.min(count / 8, 1) * 40;
  const sessionScore = Math.min(sessions.size / 2, 1) * 30;
  const formatScore = Math.min(formats.size / 2, 1) * 30;
  const consistency = volumeScore + sessionScore + formatScore;

  // Retention (MVP): reviews come later; give credit once practice spans days
  const days = new Set(attempts.map((a) => a.created_at.slice(0, 10)));
  const retention = Math.min(days.size / 3, 1) * 100;

  const mastery = accuracy * 0.45 + independence * 0.25 + consistency * 0.2 + retention * 0.1;

  // Independent-correct share of the recent window (used by promotion rules)
  const independentCorrect =
    recent.length === 0
      ? 0
      : recent.filter((a) => a.correct && a.attempt_number <= 1 && a.hint_level === 0).length / recent.length;
  const lightOrNoScaffold =
    recent.length === 0 ? 0 : recent.filter((a) => a.hint_level <= 1).length / recent.length;

  // Band promotion (spec §8). Bands never demote automatically.
  let band: Band = previousBand;
  if (previousBand === "emerging") {
    if (mastery >= 60 && accuracy >= 65 && count >= 6 && lightOrNoScaffold >= 0.5) band = "on_track";
  } else if (previousBand === "on_track") {
    if (mastery >= 78 && accuracy >= 80 && count >= 8 && independentCorrect >= 0.7 && sessions.size >= 2)
      band = "stretch";
  }

  // Status
  let status: string = band;
  if (count === 0) status = "not_started";
  else if (
    band === "stretch" &&
    mastery >= 85 &&
    accuracy >= 85 &&
    independentCorrect >= 0.8 &&
    count >= 10 &&
    formats.size >= 3
  ) {
    status = "mastery_candidate";
  }

  return {
    currentBand: band,
    status,
    masteryScore: round2(mastery),
    accuracyScore: round2(accuracy),
    independenceScore: round2(independence),
    consistencyScore: round2(consistency),
    retentionScore: round2(retention),
    interactionCount: count,
  };
}

/** Read current band for a student+skill (default 'emerging'). */
export async function getCurrentBand(
  supabase: SupabaseClient,
  studentId: string,
  skillId: string,
): Promise<Band> {
  const { data } = await supabase
    .from("student_skill_mastery")
    .select("current_band")
    .eq("student_user_id", studentId)
    .eq("skill_id", skillId)
    .maybeSingle();
  const band = data?.current_band as Band | undefined;
  return band === "on_track" || band === "stretch" ? band : "emerging";
}

/**
 * Recalculate mastery for one student+skill from skill_attempts and upsert
 * the student_skill_mastery row. Call after each recorded attempt.
 */
export async function recalcSkillMastery(
  supabase: SupabaseClient,
  studentId: string,
  skillId: string,
): Promise<MasteryState> {
  const { data: rows } = await supabase
    .from("skill_attempts")
    .select("correct, attempt_number, hint_level, question_type, source, session_id, created_at")
    .eq("student_user_id", studentId)
    .eq("skill_id", skillId)
    .order("created_at", { ascending: true })
    .limit(50);

  const attempts = (rows ?? []) as AttemptRow[];
  const previousBand = await getCurrentBand(supabase, studentId, skillId);
  const state = computeMastery(attempts, previousBand);

  await supabase.from("student_skill_mastery").upsert(
    {
      student_user_id: studentId,
      skill_id: skillId,
      current_band: state.currentBand,
      status: state.status,
      mastery_score: state.masteryScore,
      accuracy_score: state.accuracyScore,
      independence_score: state.independenceScore,
      consistency_score: state.consistencyScore,
      retention_score: state.retentionScore,
      interaction_count: state.interactionCount,
      last_practiced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_user_id,skill_id" },
  );

  return state;
}
