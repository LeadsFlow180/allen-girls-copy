/**
 * POST /api/games/report
 *
 * Trusted game→platform bridge for games that grade themselves (like Jurassic
 * Journey and Screen Hop). The game reports what happened; the server records it:
 *
 *   attempts  → one skill_attempts row each (source='game') + mastery recalc
 *               + session question tallies (feeds parent/teacher dashboards)
 *   coinsTotal→ every in-game coin/gem/jewel becomes real store points
 *               (COIN_TO_POINTS each), always clamped by the daily game cap so
 *               games can supplement lessons but never be farmed.
 *
 * The browser is trusted to grade (per product decision), but points are still
 * server-minted and capped, and only a signed-in student can write their own
 * rows (RLS + ownership check).
 *
 * Body: {
 *   sessionId:  string (uuid)
 *   attempts?:  Array<{ skillId, subject?, lessonName?, correct, firstTry? }>
 *   coinsTotal?: number   // cumulative coins EARNED this session (monotonic)
 * }
 * Returns: { ok, pointsAwarded, newBalance, questionsAsked, questionsCorrect }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { recalcSkillMastery } from "@/lib/lms/mastery/engine";
import { awardPoints } from "@/lib/rewards/points-engine";
import { capGameAward, COIN_TO_POINTS } from "@/lib/games/points";

const attemptSchema = z.object({
  skillId: z.string().min(1).max(80),
  subject: z.string().max(40).nullish(),
  lessonName: z.string().max(200).nullish(),
  correct: z.boolean(),
  firstTry: z.boolean().optional(),
});

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  attempts: z.array(attemptSchema).max(200).optional(),
  coinsTotal: z.number().int().min(0).max(1_000_000).optional(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  let json: unknown;
  try { json = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const { sessionId, attempts = [], coinsTotal } = parsed.data;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("game_sessions")
    .select("id, game_slug, questions_asked, questions_correct, points_awarded, fun_coins, ended_at")
    .eq("id", sessionId)
    .eq("student_user_id", user.id)
    .maybeSingle();
  if (!session || session.ended_at) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }

  // ── Attempts → skill_attempts rows + session tallies ────────────────────
  let askedInc = 0;
  let correctInc = 0;
  const skillsTouched = new Set<string>();

  if (attempts.length > 0) {
    const rows = attempts.map((a) => {
      askedInc += 1;
      if (a.correct) correctInc += 1;
      skillsTouched.add(a.skillId);
      return {
        student_user_id: user.id,
        skill_id: a.skillId,
        // Synthetic non-null id/band — these games own their questions, so there
        // is no content-bank question to reference.
        question_id: `game:${session.game_slug}:${a.skillId}`,
        question_band: "on_track",
        correct: a.correct,
        attempt_number: a.firstTry === false ? 2 : 1,
        hint_level: 0,
        response_ms: null,
        question_type: null,
        source: "game",
        game_slug: session.game_slug,
        session_id: sessionId,
      };
    });
    await supabase.from("skill_attempts").insert(rows);

    // Refresh rolling mastery per skill (guarded — unknown skills are fine).
    for (const skillId of skillsTouched) {
      try {
        await recalcSkillMastery(supabase, user.id, skillId);
      } catch {
        /* skill not in registry yet — attempt is still recorded for reports */
      }
    }
  }

  // ── Coins → store points (capped) ───────────────────────────────────────
  let pointsAwarded = 0;
  let newBalance: number | null = null;
  const prevCoins = (session.fun_coins as number) ?? 0;
  const newCoins = typeof coinsTotal === "number" ? Math.max(0, coinsTotal - prevCoins) : 0;

  if (newCoins > 0) {
    pointsAwarded = await capGameAward(supabase, user.id, newCoins * COIN_TO_POINTS);
    if (pointsAwarded > 0) {
      const result = await awardPoints({
        supabase,
        studentId: user.id,
        amount: pointsAwarded,
        eventType: "game_coins",
        referenceId: sessionId,
      });
      newBalance = result.newBalance;
    }
  }

  // ── Persist session updates ─────────────────────────────────────────────
  const updates: Record<string, number> = {};
  if (askedInc > 0) updates.questions_asked = (session.questions_asked as number) + askedInc;
  if (correctInc > 0) updates.questions_correct = (session.questions_correct as number) + correctInc;
  if (pointsAwarded > 0) updates.points_awarded = (session.points_awarded as number) + pointsAwarded;
  if (typeof coinsTotal === "number") updates.fun_coins = Math.max(prevCoins, coinsTotal);
  if (Object.keys(updates).length > 0) {
    await supabase.from("game_sessions").update(updates).eq("id", sessionId);
  }

  return NextResponse.json({
    ok: true,
    pointsAwarded,
    newBalance,
    questionsAsked: (session.questions_asked as number) + askedInc,
    questionsCorrect: (session.questions_correct as number) + correctInc,
  });
}
