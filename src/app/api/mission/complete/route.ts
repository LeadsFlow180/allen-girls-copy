/**
 * POST /api/mission/complete
 * Saves a skill completion, awards points, handles streak, and (if all skills
 * done) records a module completion.
 *
 * Body: {
 *   moduleId:   string
 *   skillId:    string
 *   worldSlug:  string
 *   subject:    string
 *   gateType:   "crisis" | "discovery"
 *   score:      number   (0–100)
 *   attempts:   number
 *   allSkillIds: string[]   (full ordered list for the module)
 * }
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { awardPoints, POINT_VALUES } from "@/lib/rewards/points-engine";
import { awardButterfly } from "@/lib/rewards/butterfly";

const bodySchema = z.object({
  moduleId:    z.string().min(1).max(40),
  skillId:     z.string().min(1).max(80),
  worldSlug:   z.string().min(1).max(60),
  subject:     z.string().min(1).max(40),
  gateType:    z.enum(["crisis", "discovery"]),
  score:       z.number().int().min(0).max(100),
  attempts:    z.number().int().min(1).max(20),
  allSkillIds: z.array(z.string().min(1).max(80)).min(1).max(20),
});

/** Update or create the daily streak row. Returns current streak value. */
async function touchStreak(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> & object,
  studentId: string,
): Promise<number> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data: existing } = await supabase
    .from("daily_streaks")
    .select("current_streak, longest_streak, last_active_date")
    .eq("student_user_id", studentId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("daily_streaks").insert({
      student_user_id: studentId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
    return 1;
  }

  const last = existing.last_active_date as string | null;
  if (last === today) return existing.current_streak as number;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  const newStreak = last === yStr ? (existing.current_streak as number) + 1 : 1;
  const longest   = Math.max(newStreak, existing.longest_streak as number);

  await supabase
    .from("daily_streaks")
    .update({ current_streak: newStreak, longest_streak: longest, last_active_date: today, updated_at: new Date().toISOString() })
    .eq("student_user_id", studentId);

  return newStreak;
}

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const { moduleId, skillId, worldSlug, subject, gateType, score, attempts, allSkillIds } = parsed.data;

  // ── Point calculation ────────────────────────────────────────────────
  const base = gateType === "crisis" ? POINT_VALUES.easy_puzzle : POINT_VALUES.medium_challenge;
  const firstTimeBonus = attempts === 1 ? POINT_VALUES.first_time_bonus : 0;
  const totalPoints = base + firstTimeBonus;

  // ── Save skill completion ────────────────────────────────────────────
  await supabase.from("skill_completions").insert({
    student_user_id: user.id,
    module_id: moduleId,
    skill_id: skillId,
    world_slug: worldSlug,
    subject_category: subject,
    gate_type: gateType,
    attempts,
    score,
    points_awarded: totalPoints,
  });

  // ── Award points ─────────────────────────────────────────────────────
  const eventType = gateType === "crisis" ? "gate_pass_crisis" : "gate_pass_discovery";
  const { newBalance } = await awardPoints({
    supabase,
    studentId: user.id,
    amount: totalPoints,
    eventType,
    referenceId: skillId,
  });

  // Award first-time bonus separately if earned
  if (firstTimeBonus > 0) {
    await awardPoints({
      supabase,
      studentId: user.id,
      amount: firstTimeBonus,
      eventType: "first_time_bonus",
      referenceId: skillId,
    });
  }

  // ── Streak ───────────────────────────────────────────────────────────
  const streak = await touchStreak(supabase, user.id);
  let streakBonus = 0;
  if (streak > 0 && streak % 3 === 0) {
    streakBonus = POINT_VALUES.streak_milestone;
    await awardPoints({
      supabase,
      studentId: user.id,
      amount: streakBonus,
      eventType: "streak_milestone",
      referenceId: `streak_${streak}`,
    });
  }

  // ── Check if module is now complete ──────────────────────────────────
  const { data: completedSkills } = await supabase
    .from("skill_completions")
    .select("skill_id")
    .eq("student_user_id", user.id)
    .eq("module_id", moduleId);

  const completedSet = new Set((completedSkills ?? []).map((r: { skill_id: string }) => r.skill_id));
  const moduleComplete = allSkillIds.every((id) => completedSet.has(id));

  let moduleBonusPoints = 0;
  const butterfliesEarned: string[] = [];

  if (moduleComplete) {
    const totalForModule = (completedSkills ?? []).length;
    moduleBonusPoints = POINT_VALUES.hard_challenge; // module completion bonus

    // Save module completion
    await supabase.from("module_completions").upsert({
      student_user_id: user.id,
      module_id: moduleId,
      world_slug: worldSlug,
      total_points: totalPoints + moduleBonusPoints,
      skills_count: totalForModule,
    }, { onConflict: "student_user_id,module_id,world_slug" });

    await awardPoints({
      supabase,
      studentId: user.id,
      amount: moduleBonusPoints,
      eventType: "placement_complete",
      referenceId: `module_${moduleId}`,
    });

    // Award a passport stamp for the subject domain (ignore if already earned)
    const domain = subject === "STEM" ? "math" : "ela";
    try {
      await supabase.from("passport_stamps").insert({
        student_user_id: user.id,
        skill_id: `${moduleId}_${domain}`,
        domain,
        tier: "on_track",
      });
    } catch { /* duplicate stamp — already earned, safe to ignore */ }

    // Try to award butterfly
    const { awarded, species } = await awardButterfly(supabase, user.id, domain, "on_track");
    if (awarded && species) butterfliesEarned.push(species.label);
  }

  return NextResponse.json({
    ok: true,
    pointsAwarded: totalPoints + firstTimeBonus + streakBonus,
    newBalance,
    streak,
    streakBonus,
    moduleComplete,
    moduleBonusPoints,
    butterfliesEarned,
  });
}
