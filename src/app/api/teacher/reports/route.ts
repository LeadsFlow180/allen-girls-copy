/**
 * GET /api/teacher/reports?days=7
 * Weekly games report for students linked to this teacher.
 */
import { NextResponse } from "next/server";

import { buildWeeklyGamesReport } from "@/lib/games/build-weekly-report";
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
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "teachers_only" }, { status: 403 });
  }

  const url = new URL(request.url);
  const daysRaw = Number(url.searchParams.get("days") ?? "7");
  const rangeDays = [7, 14, 30].includes(daysRaw) ? daysRaw : 7;

  const { data: links } = await supabase
    .from("teacher_students")
    .select("student_user_id")
    .eq("teacher_user_id", user.id);

  const studentIds = (links ?? []).map((l: { student_user_id: string }) => l.student_user_id);

  const nameById = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", studentIds);
    for (const p of profiles ?? []) {
      nameById.set(p.id, p.display_name || "Student");
    }
  }

  const report = await buildWeeklyGamesReport(supabase, studentIds, nameById, rangeDays);
  return NextResponse.json({ report });
}
