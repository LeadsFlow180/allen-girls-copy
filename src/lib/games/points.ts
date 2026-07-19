/**
 * Game points rules — GAME-MASTER-SPEC §5. Server-side only.
 * Games pay less than missions, with a daily cap, so games supplement
 * lessons and can never be farmed for the store.
 */
import type { SupabaseClient } from "@supabase/ssr";

import type { Band } from "@/data/lms/curriculum/content-bank/types";

/** Points per correct answer: band × how much help was needed. */
const GAME_QUESTION_RATES: Record<Band, [number, number, number]> = {
  //           attempt 1, after hint, after scaffold
  emerging: [8, 5, 3],
  on_track: [12, 8, 4],
  stretch: [16, 10, 5],
};

/** +5 for finishing a session that included ≥ 3 answered questions. */
export const SESSION_COMPLETE_BONUS = 5;
export const SESSION_BONUS_MIN_QUESTIONS = 3;

/**
 * How many store points one in-game coin/gem/jewel is worth.
 * Every game's collectible currency converts to real store points at this rate
 * (still subject to the daily cap below so games can't be farmed).
 */
export const COIN_TO_POINTS = 1;

/** Wallet points from games max out at 60/day (mastery still records past it). */
export const GAME_DAILY_POINT_CAP = 60;

export function gameQuestionPoints(band: Band, attemptNumber: number, hintLevel: number): number {
  const rates = GAME_QUESTION_RATES[band];
  if (hintLevel >= 2 || attemptNumber >= 3) return rates[2];
  if (hintLevel === 1 || attemptNumber === 2) return rates[1];
  return rates[0];
}

/** Sum of game-sourced wallet points earned today (UTC day). */
export async function gamePointsEarnedToday(
  supabase: SupabaseClient,
  studentId: string,
): Promise<number> {
  const dayStart = `${new Date().toISOString().split("T")[0]}T00:00:00.000Z`;
  const { data } = await supabase
    .from("point_transactions")
    .select("amount, event_type, created_at")
    .eq("student_user_id", studentId)
    .in("event_type", ["game_question_correct", "game_session_complete", "game_coins"])
    .gte("created_at", dayStart);

  return (data ?? []).reduce((sum, row) => sum + Math.max(0, row.amount as number), 0);
}

/** Clamp a proposed award so today's game total never exceeds the cap. */
export async function capGameAward(
  supabase: SupabaseClient,
  studentId: string,
  proposed: number,
): Promise<number> {
  if (proposed <= 0) return 0;
  const earnedToday = await gamePointsEarnedToday(supabase, studentId);
  return Math.max(0, Math.min(proposed, GAME_DAILY_POINT_CAP - earnedToday));
}
