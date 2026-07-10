/**
 * GET /api/rewards/sanctuary — return student's butterfly collection + passport stamps.
 */
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSanctuaryState, allSpecies } from "@/lib/rewards/butterfly";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
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

  const [butterflies, { data: stamps }] = await Promise.all([
    getSanctuaryState(supabase, user.id),
    supabase
      .from("passport_stamps")
      .select("skill_id, domain, tier, earned_at")
      .eq("student_user_id", user.id)
      .order("earned_at", { ascending: false }),
  ]);

  const earnedKeys = new Set(butterflies.map((b) => b.species_key));

  return NextResponse.json({
    butterflies,
    allSpecies: allSpecies().map((s) => ({ ...s, earned: earnedKeys.has(s.key) })),
    stamps: stamps ?? [],
  });
}
