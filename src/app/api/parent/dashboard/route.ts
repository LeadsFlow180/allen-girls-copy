/**
 * GET /api/parent/dashboard
 * Returns all children linked to this parent with full progress (slides, quizzes, quests, missions).
 */
import { NextResponse } from "next/server";

import { fetchExtendedProgressByStudent } from "@/lib/parent/fetch-child-extended-progress";
import type { ParentDashboardChild } from "@/lib/parent/parent-dashboard-types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type { ParentDashboardChild } from "@/lib/parent/parent-dashboard-types";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const { data: studentLinks } = await supabase
    .from("student_profiles")
    .select("user_id, parent_approved_at")
    .eq("parent_user_id", user.id)
    .not("parent_approved_at", "is", null);

  if (!studentLinks || studentLinks.length === 0) {
    return NextResponse.json({ children: [] as ParentDashboardChild[] });
  }

  const studentIds = studentLinks.map((sl: { user_id: string }) => sl.user_id);

  const admin = createServiceRoleSupabaseClient();
  /** Service role reads all child rows; avoids missing RLS policies on learn_* tables. */
  const readDb = admin ?? supabase;

  const [
    profilesRes,
    placementsRes,
    domainTiersRes,
    learningPathsRes,
    walletsRes,
    butterfliesRes,
    transactionsRes,
    extendedByStudent,
  ] = await Promise.all([
    readDb.from("profiles").select("id, display_name").in("id", studentIds),
    readDb
      .from("placement_results")
      .select("student_user_id, score, completed_at")
      .in("student_user_id", studentIds)
      .order("completed_at", { ascending: false }),
    readDb
      .from("student_domain_tiers")
      .select("student_user_id, domain, tier, percent")
      .in("student_user_id", studentIds),
    readDb
      .from("student_learning_path")
      .select("student_user_id, focus_domain, recommended_world_slug, overall_tier, next_skill_ids")
      .in("student_user_id", studentIds),
    readDb
      .from("points_wallet")
      .select("student_user_id, balance, lifetime_earned")
      .in("student_user_id", studentIds),
    readDb
      .from("butterfly_sanctuary")
      .select("student_user_id, species_key, label, earned_at")
      .in("student_user_id", studentIds),
    readDb
      .from("point_transactions")
      .select("student_user_id, event_type, amount, created_at")
      .in("student_user_id", studentIds)
      .order("created_at", { ascending: false })
      .limit(50),
    fetchExtendedProgressByStudent(readDb, studentIds),
  ]);

  const profilesData = profilesRes.data;
  const placements = placementsRes.data;
  const domainTiers = domainTiersRes.data;
  const learningPaths = learningPathsRes.data;
  const wallets = walletsRes.data;
  const butterflies = butterfliesRes.data;
  const transactions = transactionsRes.data;

  if (process.env.NODE_ENV !== "production") {
    const errors = [
      profilesRes.error,
      placementsRes.error,
      domainTiersRes.error,
      learningPathsRes.error,
      walletsRes.error,
      butterfliesRes.error,
      transactionsRes.error,
    ].filter(Boolean);
    if (errors.length) {
      console.error("[api/parent/dashboard] read errors", errors);
    }
    if (!admin) {
      console.warn(
        "[api/parent/dashboard] SUPABASE_SERVICE_ROLE_KEY missing — ensure migrations 015 and 016 are applied for parent reads.",
      );
    }
  }

  const mostRecentPlacement = new Map<string, (typeof placements extends (infer T)[] | null ? T : never)>();
  for (const p of placements ?? []) {
    if (!mostRecentPlacement.has(p.student_user_id)) {
      mostRecentPlacement.set(p.student_user_id, p);
    }
  }

  const children: ParentDashboardChild[] = studentLinks.map((sl: { user_id: string; parent_approved_at: string }) => {
    const sid = sl.user_id;
    const prof = (profilesData ?? []).find((p: { id: string }) => p.id === sid);
    const pl = mostRecentPlacement.get(sid);
    const score = pl?.score as {
      tier?: string;
      elaPercent?: number;
      mathPercent?: number;
      overallPercent?: number;
    } | null;
    const tiers = (domainTiers ?? [])
      .filter((d: { student_user_id: string }) => d.student_user_id === sid)
      .map((d: { domain: string; tier: string; percent: number }) => ({
        domain: d.domain,
        tier: d.tier,
        percent: d.percent,
      }));
    const lp = (learningPaths ?? []).find((l: { student_user_id: string }) => l.student_user_id === sid);
    const wallet = (wallets ?? []).find((w: { student_user_id: string }) => w.student_user_id === sid);
    const butt = (butterflies ?? [])
      .filter((b: { student_user_id: string }) => b.student_user_id === sid)
      .map((b: { species_key: string; label: string; earned_at: string }) => ({
        speciesKey: b.species_key,
        label: b.label,
        earnedAt: b.earned_at,
      }));
    const activity = (transactions ?? [])
      .filter((t: { student_user_id: string }) => t.student_user_id === sid)
      .slice(0, 10)
      .map((t: { event_type: string; amount: number; created_at: string }) => ({
        eventType: t.event_type,
        amount: t.amount,
        createdAt: t.created_at,
      }));

    return {
      userId: sid,
      displayName: (prof as { display_name?: string } | undefined)?.display_name ?? "Learner",
      approvedAt: sl.parent_approved_at,
      placement:
        pl && score
          ? {
              tier: score.tier ?? "—",
              elaPercent: score.elaPercent ?? 0,
              mathPercent: score.mathPercent ?? 0,
              overallPercent: score.overallPercent ?? 0,
              completedAt: pl.completed_at as string,
            }
          : null,
      domainTiers: tiers,
      learningPath: lp
        ? {
            focusDomain: lp.focus_domain as string,
            recommendedWorldSlug: lp.recommended_world_slug as string,
            overallTier: lp.overall_tier as string,
            nextSkillIds: (lp.next_skill_ids as string[]) ?? [],
          }
        : null,
      points: wallet
        ? { balance: wallet.balance as number, lifetimeEarned: wallet.lifetime_earned as number }
        : null,
      butterflies: butt,
      recentActivity: activity,
      progress:
        extendedByStudent.get(sid) ?? {
          slides: [],
          quizzes: [],
          questDays: [],
          missions: [],
          modulesCompleted: [],
          streak: null,
          checkpoints: [],
          summary: {
            slideSessions: 0,
            completedSlideSessions: 0,
            missionsCompleted: 0,
            missionsInProgress: 0,
            latestSlideScene: null,
            latestSlideTotal: null,
            latestMissionIndex: null,
            quizCount: 0,
            avgQuizPercent: null,
            questsClaimedTotal: 0,
            skillsPassed: 0,
            modulesCleared: 0,
          },
        },
    };
  });

  return NextResponse.json(
    { children },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
