import { NextResponse } from "next/server";
import { z } from "zod";

import { OpenMaicProxyError, postToOpenMaic } from "@/lib/voice/openmaic-client";

const completeSchema = z.object({
  sessionId: z.string().min(1).max(128),
  learnerId: z.string().min(1).max(128),
  lessonId: z.string().min(1).max(128),
  phase: z.literal("finish"),
  xpEarned: z.number().int().min(0).max(5000),
});

const completeResponseSchema = z.object({
  saved: z.boolean(),
  summaryText: z.string(),
  summaryAudioUrl: z.string().url(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = completeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  try {
    const data = await postToOpenMaic<typeof parsed.data, unknown>(
      "/api/voice/session/complete",
      parsed.data
    );

    const validated = completeResponseSchema.safeParse(data);
    if (!validated.success) {
      return NextResponse.json(
        { error: "invalid_openmaic_response" },
        { status: 502 }
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    if (error instanceof OpenMaicProxyError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json({ error: "voice_proxy_failed" }, { status: 500 });
  }
}

