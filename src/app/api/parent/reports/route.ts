/**
 * GET /api/parent/reports?days=7
 * Weekly games report for all approved children linked to this guardian.
 */
import { NextResponse } from "next/server";

import { buildWeeklyGamesReport } from "@/lib/games/build-weekly-report";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "parent") {
    return NextResponse.json({ error: "parents_only" }, { status: 403 });
  }

  const url = new URL(request.url);
  const daysRaw = Number(url.searchParams.get("days") ?? "7");
  const rangeDays = [7, 14, 30].includes(daysRaw) ? daysRaw : 7;

  const { data: studentLinks } = await supabase
    .from("student_profiles")
    .select("user_id")
    .eq("parent_user_id", user.id)
    .not("parent_approved_at", "is", null);

  const studentIds = (studentLinks ?? []).map((s: { user_id: string }) => s.user_id);
  const admin = createServiceRoleSupabaseClient();
  const readDb = admin ?? supabase;

  const nameById = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: profiles } = await readDb.from("profiles").select("id, display_name").in("id", studentIds);
    for (const p of profiles ?? []) {
      nameById.set(p.id, p.display_name || "Learner");
    }
  }

  const report = await buildWeeklyGamesReport(readDb, studentIds, nameById, rangeDays);
  return NextResponse.json({ report });
}
