/**
 * GET  /api/rewards/points — return current balance + recent transactions.
 * POST /api/rewards/points — award points (internal/server use).
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { awardPoints, getBalance, POINT_VALUES } from "@/lib/rewards/points-engine";

const awardSchema = z.object({
  eventType: z.enum([
    "gate_pass_crisis",
    "gate_pass_discovery",
    "first_time_bonus",
    "daily_login",
    "streak_milestone",
    "clean_run_bonus",
    "placement_complete",
  ]),
  referenceId: z.string().max(100).optional(),
  isFirstTime: z.boolean().optional(),
  cleanRun: z.boolean().optional(),
});

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

  const balance = await getBalance(supabase, user.id);

  const { data: transactions } = await supabase
    .from("point_transactions")
    .select("amount, event_type, reference_id, created_at")
    .eq("student_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ balance, transactions: transactions ?? [] });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  let json: unknown;
  try { json = await request.json(); } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = awardSchema.safeParse(json);
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

  const { eventType, referenceId, isFirstTime, cleanRun } = parsed.data;

  const baseMap: Record<string, number> = {
    gate_pass_crisis:    POINT_VALUES.easy_puzzle,
    gate_pass_discovery: POINT_VALUES.medium_challenge,
    daily_login:         POINT_VALUES.daily_login,
    streak_milestone:    POINT_VALUES.streak_milestone,
    clean_run_bonus:     POINT_VALUES.clean_run_bonus,
    first_time_bonus:    POINT_VALUES.first_time_bonus,
    placement_complete:  POINT_VALUES.medium_challenge,
  };

  let total = baseMap[eventType] ?? 0;
  if (isFirstTime) total += POINT_VALUES.first_time_bonus;
  if (cleanRun)    total += POINT_VALUES.clean_run_bonus;

  const { newBalance } = await awardPoints({
    supabase,
    studentId: user.id,
    amount: total,
    eventType,
    referenceId,
  });

  return NextResponse.json({ awarded: total, newBalance });
}
