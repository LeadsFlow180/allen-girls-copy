import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const checkpointSchema = z.object({
  missionId: z.string().min(1).max(80),
  checkpointType: z.enum(["guided_practice_start", "gate_start", "gate_complete", "pre_gateway"]),
  gateType: z.enum(["crisis", "discovery"]).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkpointSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const row = {
    student_user_id: user.id,
    mission_id: parsed.data.missionId,
    checkpoint_type: parsed.data.checkpointType,
    gate_type: parsed.data.gateType ?? null,
    payload: parsed.data.payload ?? {},
  };

  const { data, error } = await supabase
    .from("mission_checkpoints")
    .insert(row)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[mission/checkpoint]", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkpoint: data });
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const missionId = url.searchParams.get("missionId");
  if (!missionId) {
    return NextResponse.json({ error: "missing_missionId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mission_checkpoints")
    .select("id, checkpoint_type, gate_type, payload, created_at")
    .eq("student_user_id", user.id)
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[mission/checkpoint:get]", error);
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  return NextResponse.json({ checkpoints: data ?? [] });
}
