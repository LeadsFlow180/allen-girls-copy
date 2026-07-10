import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluateGate } from "@/data/lms/gates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { awardPoints, POINT_VALUES } from "@/lib/rewards/points-engine";

const bodySchema = z.object({
  gateType: z.enum(["crisis", "discovery"]),
  prompt: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
  expectedKeywords: z.array(z.string().min(1).max(60)).max(12).optional(),
  attemptCount: z.number().int().min(1).max(10),
  nickname: z.string().min(1).max(32).default("Recruit"),
});

export async function POST(request: Request) {
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

  const result = await evaluateGate(parsed.data);

  // Award points if gate passed and Supabase is configured
  if (result.passed && isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.role === "student") {
            const eventType = parsed.data.gateType === "crisis"
              ? "gate_pass_crisis"
              : "gate_pass_discovery";
            const base = parsed.data.gateType === "crisis"
              ? POINT_VALUES.easy_puzzle
              : POINT_VALUES.medium_challenge;
            await awardPoints({
              supabase,
              studentId: user.id,
              amount: base,
              eventType,
              referenceId: parsed.data.prompt.slice(0, 80),
            });
          }
        }
      }
    } catch (e) {
      console.error("[phase5] gate reward error", e);
    }
  }

  return NextResponse.json(result);
}
