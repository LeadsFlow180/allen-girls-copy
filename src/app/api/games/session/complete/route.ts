/**
 * POST /api/games/session/complete
 * Closes a game session: records duration + arcade fun-coins (decoration only),
 * and pays the +5 completion bonus for academic sessions with ≥ 3 answered
 * questions (subject to the daily game cap).
 *
 * Body: { sessionId: string, funCoins?: number }
 * Returns: { ok, bonusAwarded, totals }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { awardPoints } from "@/lib/rewards/points-engine";
import {
  capGameAward,
  SESSION_BONUS_MIN_QUESTIONS,
  SESSION_COMPLETE_BONUS,
} from "@/lib/games/points";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  funCoins: z.number().int().min(0).max(1_000_000).optional(),
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

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("game_sessions")
    .select("id, game_class, started_at, ended_at, questions_asked, questions_correct, points_awarded")
    .eq("id", parsed.data.sessionId)
    .eq("student_user_id", user.id)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }
  if (session.ended_at) {
    return NextResponse.json({ error: "already_completed" }, { status: 409 });
  }

  const endedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.round((endedAt.getTime() - new Date(session.started_at as string).getTime()) / 1000),
  );

  // Completion bonus: academic sessions only, ≥ 3 answered questions, capped.
  let bonusAwarded = 0;
  if (
    session.game_class === "academic" &&
    (session.questions_asked as number) >= SESSION_BONUS_MIN_QUESTIONS
  ) {
    bonusAwarded = await capGameAward(supabase, user.id, SESSION_COMPLETE_BONUS);
    if (bonusAwarded > 0) {
      await awardPoints({
        supabase,
        studentId: user.id,
        amount: bonusAwarded,
        eventType: "game_session_complete",
        referenceId: parsed.data.sessionId,
      });
    }
  }

  await supabase
    .from("game_sessions")
    .update({
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      // Fun coins are decoration — stored for the session record, never converted.
      fun_coins: parsed.data.funCoins ?? 0,
      points_awarded: (session.points_awarded as number) + bonusAwarded,
    })
    .eq("id", parsed.data.sessionId);

  return NextResponse.json({
    ok: true,
    bonusAwarded,
    totals: {
      durationSeconds,
      questionsAsked: session.questions_asked,
      questionsCorrect: session.questions_correct,
      pointsAwarded: (session.points_awarded as number) + bonusAwarded,
    },
  });
}
