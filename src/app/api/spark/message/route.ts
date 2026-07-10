import { NextResponse } from "next/server";
import { z } from "zod";

import { generateSparkMessage, type SparkMode } from "@/lib/ai/spark";

const bodySchema = z.object({
  nickname: z.string().min(1).max(32),
  mode: z.enum(["intro", "practice", "crisis", "discovery", "protective", "reward", "bored", "reentry"]),
  missionTitle: z.string().max(120).optional(),
  worldTitle: z.string().max(120).optional(),
  learnerSignals: z.array(z.string().max(80)).max(8).optional(),
  instruction: z.string().max(500).optional(),
  maxWords: z.number().int().min(20).max(140).optional(),
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

  const payload = parsed.data;
  const text = await generateSparkMessage({
    nickname: payload.nickname,
    mode: payload.mode as SparkMode,
    missionTitle: payload.missionTitle,
    worldTitle: payload.worldTitle,
    learnerSignals: payload.learnerSignals,
    instruction: payload.instruction,
    maxWords: payload.maxWords,
  });

  return NextResponse.json({ text });
}
