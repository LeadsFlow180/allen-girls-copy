import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_LEARN_CLASSROOM_ID } from "@/lib/learn/constants";
import { isSupabaseServerAuthEnabled } from "@/lib/supabase/env";
import { safeServerAuthUser } from "@/lib/supabase/server";

const bodySchema = z.object({
  language: z.string().min(2).max(10),
  sectionId: z.number().int().min(1).max(200),
  unitIndex: z.number().int().min(0).max(200),
  step: z.enum(["start", "lesson", "chest", "practice", "review"]),
  dbSectionId: z.number().int().positive().optional(),
  dbUnitId: z.number().int().positive().optional(),
  guestSessionId: z.string().uuid().optional(),
  /** Resume classroom at this slide (0-based). */
  resumeSceneIndex: z.number().int().min(0).max(200).optional(),
  resumeSceneId: z.string().min(1).max(200).optional(),
  resumePlaybackCompleted: z.boolean().optional(),
  totalSlides: z.number().int().min(1).max(200).optional(),
});

function toBase64(text: string) {
  return Buffer.from(text, "utf8").toString("base64");
}

function isDebugMode() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: Request) {
  const debugSteps: string[] = [];
  const debugMeta: Record<string, unknown> = {};
  const pushStep = (step: string) => {
    debugSteps.push(step);
    if (isDebugMode()) {
      console.info("[api/learn/redirect]", step);
    }
  };
  const fail = (status: number, error: string, extra?: Record<string, unknown>) =>
    NextResponse.json(
      {
        error,
        ...(isDebugMode()
          ? {
              debug: {
                stage: debugSteps[debugSteps.length - 1] ?? "unknown",
                steps: debugSteps,
                ...debugMeta,
                ...(extra ?? {}),
              },
            }
          : {}),
      },
      { status },
    );

  pushStep("start");

  const user = isSupabaseServerAuthEnabled()
    ? await safeServerAuthUser()
    : null;
  pushStep("auth_checked");
  debugMeta.userPresent = Boolean(user);

  const redirectSecret = process.env.AI_SCHOOL_REDIRECT_SECRET?.trim() || "";
  if (!process.env.AI_SCHOOL_SITE_URL?.trim() || !redirectSecret) {
    return fail(503, "redirect_env_not_configured");
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return fail(400, "invalid_payload_encoding");
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return fail(400, "invalid_payload_encoding");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "validation_failed");
  }
  pushStep("schema_valid");

  const classroomId = DEFAULT_LEARN_CLASSROOM_ID;
  const classroomPath = `/classroom/${encodeURIComponent(classroomId)}`;
  const siteUrlRaw = process.env.AI_SCHOOL_SITE_URL!.trim() + classroomPath;
  const now = Date.now();
  const learnerId = user?.id ?? null;
  const guestSessionId = learnerId ? null : (parsed.data.guestSessionId ?? randomUUID());

  if (!learnerId && !guestSessionId) {
    return fail(400, "missing_session_owner", {
      reason: "requires signed-in learner or guestSessionId",
    });
  }

  const payload = {
    /** Supabase auth.users.id when student is signed in on AGA */
    learnerId,
    guestSessionId,
    language: parsed.data.language,
    sectionId: parsed.data.sectionId,
    unitIndex: parsed.data.unitIndex,
    step: parsed.data.step,
    dbSectionId: parsed.data.dbSectionId ?? null,
    dbUnitId: parsed.data.dbUnitId ?? null,
    classroomId,
    resumeSceneIndex: parsed.data.resumeSceneIndex ?? null,
    resumeSceneId: parsed.data.resumeSceneId ?? null,
    resumePlaybackCompleted: parsed.data.resumePlaybackCompleted ?? null,
    totalSlides: parsed.data.totalSlides ?? null,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
    nonce: randomUUID(),
    source: "allen-girls-adventures",
  };

  const payloadEncoded = toBase64(JSON.stringify(payload));
  const signature = createHmac("sha256", redirectSecret)
    .update(payloadEncoded)
    .digest("hex");

  let baseUrl: URL;
  try {
    baseUrl = new URL(siteUrlRaw);
  } catch {
    return fail(503, "invalid_site_url");
  }
  baseUrl.searchParams.set("payload", payloadEncoded);
  baseUrl.searchParams.set("sig", signature);

  return NextResponse.json({
    ok: true,
    redirectUrl: baseUrl.toString(),
    guestSessionId,
    classroomId,
  });
}
