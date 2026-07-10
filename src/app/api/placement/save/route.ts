import { NextResponse } from "next/server";
import { z } from "zod";

import { buildLearningPathRecommendation } from "@/data/lms/mission-engine";
import type { PlacementScoreResult } from "@/data/lms/placement/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { awardPoints, POINT_VALUES } from "@/lib/rewards/points-engine";
import { awardButterfly } from "@/lib/rewards/butterfly";

const scoreSchema = z.object({
  tier: z.enum(["emerging", "on_track", "stretch"]),
  elaCorrect: z.number(),
  elaTotal: z.number(),
  mathCorrect: z.number(),
  mathTotal: z.number(),
  totalCorrect: z.number(),
  totalQuestions: z.number(),
  elaPercent: z.number(),
  mathPercent: z.number(),
  overallPercent: z.number(),
});

const bodySchema = z.object({
  displayName: z.string().min(1).max(80),
  score: scoreSchema,
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const { displayName, score } = parsed.data;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const row = {
    student_user_id: userData.user.id,
    display_name: displayName.trim().slice(0, 80),
    score,
    version: 1,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("placement_results")
    .insert(row)
    .select("id")
    .single();

  if (insertError) {
    console.error("placement save error", insertError);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  const placementId = inserted?.id as string;
  const scoreTyped = score as PlacementScoreResult;
  const trimmedName = displayName.trim().slice(0, 80);
  const recommendation = buildLearningPathRecommendation(scoreTyped, trimmedName);

  const nowIso = new Date().toISOString();

  const { error: domainErr } = await supabase.from("student_domain_tiers").upsert(
    [
      {
        student_user_id: userData.user.id,
        domain: "ela",
        tier: recommendation.elaTier,
        percent: Math.round(score.elaPercent),
        placement_result_id: placementId,
        updated_at: nowIso,
      },
      {
        student_user_id: userData.user.id,
        domain: "math",
        tier: recommendation.mathTier,
        percent: Math.round(score.mathPercent),
        placement_result_id: placementId,
        updated_at: nowIso,
      },
    ],
    { onConflict: "student_user_id,domain" },
  );

  if (domainErr) {
    console.error("[phase2] student_domain_tiers upsert", domainErr);
  }

  const { error: pathErr } = await supabase.from("student_learning_path").upsert(
    {
      student_user_id: userData.user.id,
      active_module_id: recommendation.activeModuleId,
      recommended_world_slug: recommendation.recommendedWorldSlug,
      focus_domain: recommendation.focusDomain,
      next_skill_ids: recommendation.nextSkillIds,
      overall_tier: recommendation.overallTier,
      updated_at: nowIso,
    },
    { onConflict: "student_user_id" },
  );

  if (pathErr) {
    console.error("[phase2] student_learning_path upsert", pathErr);
  }

  const phase2Ok = !domainErr && !pathErr;

  // ── Phase 5: award points + butterflies for placement completion ──────
  let pointsAwarded = 0;
  const butterfliesEarned: string[] = [];
  try {
    const { newBalance } = await awardPoints({
      supabase,
      studentId: userData.user.id,
      amount: POINT_VALUES.medium_challenge,
      eventType: "placement_complete",
      referenceId: placementId,
    });
    pointsAwarded = newBalance;

    for (const domain of ["ela", "math"] as const) {
      const tier = domain === "ela" ? recommendation.elaTier : recommendation.mathTier;
      const { awarded, species } = await awardButterfly(supabase, userData.user.id, domain, tier);
      if (awarded && species) butterfliesEarned.push(species.label);
    }
  } catch (e) {
    console.error("[phase5] rewards award error", e);
  }

  return NextResponse.json({
    ok: true,
    id: placementId,
    phase2Ok,
    learningPath: recommendation,
    rewards: { pointsAwarded, butterfliesEarned },
  });
}
