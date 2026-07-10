import { NextResponse } from "next/server";
import { z } from "zod";

import { OpenMaicProxyError, postToOpenMaic } from "@/lib/voice/openmaic-client";

const startSchema = z.object({
  learnerId: z.string().min(1).max(128),
  lessonId: z.string().min(1).max(128),
  phase: z.literal("start"),
  targetLanguage: z.string().min(2).max(10),
  phrase: z.string().min(1).max(200),
});

const startResponseSchema = z.object({
  sessionId: z.string().min(1),
  audioUrl: z.string().url(),
  mode: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  try {
    const data = await postToOpenMaic<typeof parsed.data, unknown>(
      "/api/voice/session/start",
      parsed.data
    );

    const validated = startResponseSchema.safeParse(data);
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

