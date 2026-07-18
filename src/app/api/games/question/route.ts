/**
 * POST /api/games/question
 * Serves the next content-bank question for an academic game session.
 * Picks: game's skillIds → student's current band for that skill → random
 * fresh question. The answer and hints are NEVER sent to the browser.
 *
 * Body: { sessionId: string, excludeIds?: string[] }
 * Returns: { ok, question: ClientQuestion, wrongAnswerPolicy }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getGameById } from "@/data/games/catalog";
import { pickNextQuestion } from "@/data/lms/curriculum/content-bank";
import { toClientQuestion } from "@/data/lms/curriculum/content-bank/types";
import { getCurrentBand } from "@/lib/lms/mastery/engine";

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  excludeIds: z.array(z.string().max(60)).max(50).optional(),
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
    .select("id, game_slug, student_user_id, ended_at")
    .eq("id", parsed.data.sessionId)
    .eq("student_user_id", user.id)
    .maybeSingle();
  if (!session || session.ended_at) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }

  const game = getGameById(session.game_slug as string);
  if (!game || game.gameClass !== "academic" || game.skillIds.length === 0) {
    return NextResponse.json({ error: "not_academic_game" }, { status: 400 });
  }

  // Rotate through the game's skills so multi-skill games spread practice.
  const skillId = game.skillIds[Math.floor(Math.random() * game.skillIds.length)];
  const band = await getCurrentBand(supabase, user.id, skillId);

  const question = pickNextQuestion(skillId, band, parsed.data.excludeIds ?? []);
  if (!question) {
    return NextResponse.json({ error: "no_questions_for_skill" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    question: toClientQuestion(question),
    wrongAnswerPolicy: game.wrongAnswerPolicy ?? "soft",
  });
}
