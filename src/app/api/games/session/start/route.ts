/**
 * POST /api/games/session/start
 * Opens a game session row for the signed-in student.
 * Body: { gameSlug: string }
 * Returns: { ok, sessionId, gameClass }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getGameById } from "@/data/games/catalog";

const bodySchema = z.object({
  gameSlug: z.string().min(1).max(60),
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

  const game = getGameById(parsed.data.gameSlug);
  if (!game) {
    return NextResponse.json({ error: "unknown_game" }, { status: 404 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const { data: session, error } = await supabase
    .from("game_sessions")
    .insert({
      student_user_id: user.id,
      game_slug: game.id,
      game_class: game.gameClass,
    })
    .select("id")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "session_create_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sessionId: session.id, gameClass: game.gameClass });
}
