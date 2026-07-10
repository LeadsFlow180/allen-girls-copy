import { NextResponse } from "next/server";
import { z } from "zod";

import { OpenMaicProxyError, postToOpenMaic } from "@/lib/voice/openmaic-client";

const attemptSchema = z.object({
  sessionId: z.string().min(1).max(128),
  learnerId: z.string().min(1).max(128),
  targetPhrase: z.string().min(1).max(240),
  attemptAudioBase64: z.string().min(1),
  attemptIndex: z.number().int().min(1).max(10),
  maxAttempts: z.number().int().min(1).max(10),
  targetLanguage: z.string().min(2).max(10),
});

const attemptResponseSchema = z.object({
  transcript: z.string(),
  score: z.number().min(0).max(1),
  attemptIndex: z.number().int().min(1),
  isPass: z.boolean(),
  feedbackText: z.string(),
  feedbackAudioUrl: z.string().url(),
  mode: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = attemptSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  try {
    const data = await postToOpenMaic<typeof parsed.data, unknown>(
      "/api/voice/practice/attempt",
      parsed.data
    );

    const validated = attemptResponseSchema.safeParse(data);
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

