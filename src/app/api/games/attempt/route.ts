/**
 * POST /api/games/attempt
 * Grades one answer server-side, records the skill_attempts row, recalculates
 * mastery, and (if correct) awards capped wallet points. The game/browser
 * never grades and never mints points.
 *
 * Body: {
 *   sessionId:     string (uuid)
 *   questionId:    string
 *   choiceIndex:   number
 *   attemptNumber: number (1..3)
 *   responseMs?:   number
 * }
 * Returns (correct):   { ok, correct: true, pointsAwarded, newBalance, band }
 * Returns (incorrect): { ok, correct: false, hint | teach }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getQuestionById } from "@/data/lms/curriculum/content-bank";
import { recalcSkillMastery } from "@/lib/lms/mastery/engine";
import { awardPoints } from "@/lib/rewards/points-engine";
import { capGameAward, gameQuestionPoints } from "@/lib/games/points";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().min(1).max(60),
  choiceIndex: z.number().int().min(0).max(10),
  attemptNumber: z.number().int().min(1).max(3),
  responseMs: z.number().int().min(0).max(10 * 60 * 1000).optional(),
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
  const { sessionId, questionId, choiceIndex, attemptNumber, responseMs } = parsed.data;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("game_sessions")
    .select("id, game_slug, questions_asked, questions_correct, points_awarded, ended_at")
    .eq("id", sessionId)
    .eq("student_user_id", user.id)
    .maybeSingle();
  if (!session || session.ended_at) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }

  const question = getQuestionById(questionId);
  if (!question) {
    return NextResponse.json({ error: "unknown_question" }, { status: 404 });
  }

  const correct = choiceIndex === question.correctIndex;
  // hint_level mirrors the attempt ladder: attempt 1 = none, 2 = light, 3 = scaffold
  const hintLevel = attemptNumber >= 3 ? 2 : attemptNumber === 2 ? 1 : 0;

  // Record evidence for EVERY attempt (feeds Independence in mastery).
  await supabase.from("skill_attempts").insert({
    student_user_id: user.id,
    skill_id: question.skillId,
    question_id: question.id,
    question_band: question.band,
    correct,
    attempt_number: attemptNumber,
    hint_level: hintLevel,
    response_ms: responseMs ?? null,
    question_type: question.questionType,
    source: "game",
    game_slug: session.game_slug,
    session_id: sessionId,
  });

  const mastery = await recalcSkillMastery(supabase, user.id, question.skillId);

  // Count each question once (on its first attempt) toward session stats.
  const askedIncrement = attemptNumber === 1 ? 1 : 0;

  if (!correct) {
    await supabase
      .from("game_sessions")
      .update({ questions_asked: (session.questions_asked as number) + askedIncrement })
      .eq("id", sessionId);

    if (attemptNumber >= 3) {
      return NextResponse.json({ ok: true, correct: false, teach: question.teach });
    }
    return NextResponse.json({
      ok: true,
      correct: false,
      hint: attemptNumber === 1 ? question.hintLight : question.hintScaffold,
    });
  }

  // Correct → points (banded rate, then daily cap)
  const proposed = gameQuestionPoints(question.band, attemptNumber, hintLevel);
  const amount = await capGameAward(supabase, user.id, proposed);

  let newBalance: number | null = null;
  if (amount > 0) {
    const result = await awardPoints({
      supabase,
      studentId: user.id,
      amount,
      eventType: "game_question_correct",
      referenceId: question.id,
    });
    newBalance = result.newBalance;
  }

  await supabase
    .from("game_sessions")
    .update({
      questions_asked: (session.questions_asked as number) + askedIncrement,
      questions_correct: (session.questions_correct as number) + 1,
      points_awarded: (session.points_awarded as number) + amount,
    })
    .eq("id", sessionId);

  return NextResponse.json({
    ok: true,
    correct: true,
    pointsAwarded: amount,
    newBalance,
    band: mastery.currentBand,
  });
}
