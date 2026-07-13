import { NextResponse } from "next/server";

import { isGeminiConfigured } from "@/lib/ai/gemini";
import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import {
  generateCompleteLibraryStory,
  libraryStoryAiRequestSchema,
} from "@/lib/library/library-story-ai";

export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "gemini_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = libraryStoryAiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const input = parsed.data;

  try {
    const result = await generateCompleteLibraryStory(input);

    if (input.singleStory && !result.body) {
      return NextResponse.json({ error: "empty_story_body" }, { status: 502 });
    }

    if (!input.singleStory) {
      if (result.chapters.length === 0) {
        return NextResponse.json({ error: "empty_chapters" }, { status: 502 });
      }
      if (result.chapters.length < input.chapterCount) {
        return NextResponse.json(
          {
            error: "incomplete_chapters",
            generated: result.chapters.length,
            requested: input.chapterCount,
            ...result,
          },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation_failed";
    console.error("[library-story-ai]", message);
    return NextResponse.json({ error: "generation_failed", detail: message }, { status: 502 });
  }
}
