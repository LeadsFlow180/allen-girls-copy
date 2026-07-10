/**
 * GET /api/teacher/dashboard
 * Returns all students linked to this teacher with summary progress data.
 */
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "teachers_only" }, { status: 403 });
  }

  // Get teacher profile (invite code + classroom name)
  const { data: teacherProfile } = await supabase
    .from("teacher_profiles")
    .select("invite_code, classroom_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get all linked students
  const { data: links } = await supabase
    .from("teacher_students")
    .select("student_user_id, linked_at")
    .eq("teacher_user_id", user.id);

  if (!links || links.length === 0) {
    return NextResponse.json({
      inviteCode: teacherProfile?.invite_code ?? null,
      classroomName: teacherProfile?.classroom_name ?? "",
      students: [],
    });
  }

  const studentIds = links.map((l: { student_user_id: string }) => l.student_user_id);

  const [
    { data: profilesData },
    { data: placements },
    { data: domainTiers },
    { data: wallets },
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name").in("id", studentIds),
    supabase
      .from("placement_results")
      .select("student_user_id, score, completed_at")
      .in("student_user_id", studentIds)
      .order("completed_at", { ascending: false }),
    supabase
      .from("student_domain_tiers")
      .select("student_user_id, domain, tier, percent")
      .in("student_user_id", studentIds),
    supabase
      .from("points_wallet")
      .select("student_user_id, balance, lifetime_earned")
      .in("student_user_id", studentIds),
  ]);

  // Most recent placement per student
  const mostRecentPlacement = new Map<string, { score: unknown; completed_at: unknown }>();
  for (const p of placements ?? []) {
    if (!mostRecentPlacement.has(p.student_user_id)) {
      mostRecentPlacement.set(p.student_user_id, p);
    }
  }

  const students = links.map((link: { student_user_id: string; linked_at: string }) => {
    const sid = link.student_user_id;
    const prof = (profilesData ?? []).find((p: { id: string }) => p.id === sid) as
      { display_name?: string } | undefined;
    const pl = mostRecentPlacement.get(sid);
    const score = pl?.score as { tier?: string; overallPercent?: number } | null;
    const tiers = (domainTiers ?? [])
      .filter((d: { student_user_id: string }) => d.student_user_id === sid)
      .map((d: { domain: string; tier: string; percent: number }) => ({
        domain: d.domain, tier: d.tier, percent: d.percent,
      }));
    const wallet = (wallets ?? []).find((w: { student_user_id: string }) => w.student_user_id === sid) as
      { balance?: number; lifetime_earned?: number } | undefined;

    return {
      userId: sid,
      displayName: prof?.display_name ?? "Learner",
      linkedAt: link.linked_at,
      placementTier: score?.tier ?? null,
      overallPercent: score?.overallPercent ?? null,
      domainTiers: tiers,
      points: wallet ? { balance: wallet.balance ?? 0, lifetimeEarned: wallet.lifetime_earned ?? 0 } : null,
    };
  });

  return NextResponse.json({
    inviteCode: teacherProfile?.invite_code ?? null,
    classroomName: teacherProfile?.classroom_name ?? "",
    students,
  });
}
