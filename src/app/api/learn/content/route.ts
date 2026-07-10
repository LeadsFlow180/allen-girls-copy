import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_LEARN_CLASSROOM_ID } from "@/lib/learn/constants";
import {
  buildContentSavedPayload,
  resolveContentOwner,
} from "@/lib/learn/content-owner";
import {
  extractPlaybackFields,
  persistQuizSubmission,
  upsertPlaybackProgress,
} from "@/lib/learn/persist-playback";
import { aiSchoolQuizSchema } from "@/lib/learn/quiz-payload";
import {
  AGA_CONTENT_SOURCE,
  assertAiSchoolSource,
  isSessionExpired,
  verifyAiSchoolSignature,
} from "@/lib/learn/verify-ai-school-signature";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PLAYBACK_STATUSES = new Set(["progress", "complete"]);

const interactionStatusSchema = z.enum([
  "start",
  "slide_viewed",
  "quiz_started",
  "quiz_filled",
  "quiz_marks",
  "progress",
  "complete",
  "quiz",
]);

const canonicalBodySchema = z.object({
  learnerId: z.string().uuid().nullable().optional(),
  guestSessionId: z.string().uuid().nullable().optional(),
  lessonContentId: z.union([z.string(), z.number()]).optional(),
  status: z.union([interactionStatusSchema, z.string()]),
  details: z.any().nullable().optional(),
  quiz: z.any().nullable().optional(),
  source: z.string(),
  sig: z.string(),
});

const redirectBodySchema = z.object({
  learnerId: z.string().uuid().nullable().optional(),
  guestSessionId: z.string().uuid().nullable().optional(),
  language: z.string().optional(),
  sectionId: z.union([z.number().int(), z.string()]).optional(),
  unitIndex: z.union([z.number().int(), z.string()]).optional(),
  step: z.string().optional(),
  dbSectionId: z.union([z.number().int(), z.string()]).nullable().optional(),
  dbUnitId: z.union([z.number().int(), z.string()]).nullable().optional(),
  lessonContentId: z.union([z.string(), z.number()]).optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  nonce: z.string().optional(),
  source: z.string(),
  sig: z.string(),
});

type NormalizedContentBody = {
  learnerId?: string | null;
  guestSessionId?: string | null;
  lessonContentId?: string | number;
  status: string;
  details?: unknown;
  quiz?: unknown;
  source: string;
  sig: string;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isDebugMode() {
  return process.env.NODE_ENV !== "production";
}

function resolveEventStatus(
  status: string,
  details: Record<string, unknown> | null,
): "progress" | "complete" | "quiz" | null {
  if (status === "quiz") return "quiz";
  if (PLAYBACK_STATUSES.has(status)) return status as "progress" | "complete";
  const step = details?.step;
  if (typeof step === "string" && PLAYBACK_STATUSES.has(step)) {
    return step as "progress" | "complete";
  }
  return null;
}

export async function POST(request: Request) {
  const debugSteps: string[] = [];
  const debugMeta: Record<string, unknown> = {};
  const pushStep = (step: string) => {
    debugSteps.push(step);
    if (isDebugMode()) console.info("[api/learn/content]", step);
  };
  const fail = (status: number, error: string, extra?: Record<string, unknown>) =>
    NextResponse.json(
      {
        error,
        ...(isDebugMode()
          ? { debug: { stage: debugSteps.at(-1), steps: debugSteps, ...debugMeta, ...extra } }
          : {}),
      },
      { status },
    );

  pushStep("start");
  const redirectSecret = process.env.AI_SCHOOL_REDIRECT_SECRET?.trim() || "";
  if (!redirectSecret) return fail(503, "secret_not_configured");

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return fail(400, "invalid_payload_encoding");
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail(400, "invalid_json");
  }

  const parsedBody = canonicalBodySchema.safeParse(body);
  let normalizedData: NormalizedContentBody | null = null;

  if (parsedBody.success) {
    normalizedData = { ...parsedBody.data, status: String(parsedBody.data.status) };
    debugMeta.schemaVariant = "canonical";
  } else {
    const redirectParsed = redirectBodySchema.safeParse(body);
    if (redirectParsed.success) {
      const r = redirectParsed.data;
      const rawObj = asObject(body);
      normalizedData = {
        learnerId: r.learnerId ?? null,
        guestSessionId: r.guestSessionId ?? null,
        lessonContentId: String(
          (typeof rawObj?.lessonContentId === "string" ||
          typeof rawObj?.lessonContentId === "number"
            ? rawObj.lessonContentId
            : null) ??
            r.lessonContentId ??
            r.dbUnitId ??
            `${r.sectionId ?? "unknown"}-${r.unitIndex ?? "unknown"}`,
        ),
        status: r.step ?? "start",
        details: {
          language: r.language ?? null,
          sectionId: r.sectionId ?? null,
          unitIndex: r.unitIndex ?? null,
          step: r.step ?? null,
          dbSectionId: r.dbSectionId ?? null,
          dbUnitId: r.dbUnitId ?? null,
          issuedAt: r.issuedAt ?? null,
          expiresAt: r.expiresAt ?? null,
          nonce: r.nonce ?? null,
        },
        quiz: {},
        source: r.source,
        sig: r.sig,
      };
      debugMeta.schemaVariant = "redirect_payload_compat";
    }
  }

  if (!normalizedData) {
    return fail(400, "invalid_body", {
      zodIssues: parsedBody.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const data = normalizedData;
  if (!assertAiSchoolSource(data.source)) {
    return fail(400, "invalid_source", { expected: AGA_CONTENT_SOURCE });
  }

  const { sig, ...dataWithoutSig } = data;
  const rawObject = asObject(body);
  const bodyForSign = { ...dataWithoutSig, source: AGA_CONTENT_SOURCE };

  pushStep("verifying_signature");
  const primary = verifyAiSchoolSignature(bodyForSign, sig, redirectSecret);
  let isValid = primary.valid;

  if (!isValid && rawObject) {
    const { sig: _s, ...rawWithoutSig } = rawObject;
    const rawForSign = { ...rawWithoutSig, source: data.source };
    isValid = verifyAiSchoolSignature(rawForSign, sig, redirectSecret).valid;
  }

  if (!isValid) {
    return fail(403, "invalid_signature", {
      expectedSig: primary.canonical,
      receivedSig: sig,
    });
  }
  pushStep("signature_valid");

  const detailsObj = asObject(data.details);
  const expiresAt =
    detailsObj?.expiresAt ?? detailsObj?.expires_at ?? rawObject?.expiresAt;
  if (isSessionExpired(expiresAt)) {
    return fail(403, "session_expired", { expiresAt });
  }

  const eventStatus = resolveEventStatus(data.status, detailsObj);
  debugMeta.eventStatus = eventStatus;

  let learnerId = data.learnerId ?? null;
  let guestSessionId = data.guestSessionId ?? null;

  const supabase = await createServerSupabaseClient();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (authData.user && supabase) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profile?.role === "student") {
      // Signed-in student on AGA: always one row per learner_id (not a new guest_session_id).
      learnerId = authData.user.id;
      guestSessionId = null;
    } else if (!learnerId && !guestSessionId) {
      learnerId = authData.user.id;
    }
  } else if (!learnerId && !guestSessionId) {
    learnerId = null;
  }

  const owner = resolveContentOwner(learnerId, guestSessionId);
  if (!owner && (eventStatus === "progress" || eventStatus === "complete" || eventStatus === "quiz")) {
    return fail(400, "missing_session_owner", {
      reason: "requires learnerId or guestSessionId from AI School redirect",
    });
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin && (eventStatus === "progress" || eventStatus === "complete" || eventStatus === "quiz")) {
    return fail(503, "supabase_service_role_not_configured");
  }

  if (eventStatus === "quiz") {
    pushStep("validating_quiz");
    const quizParsed = aiSchoolQuizSchema.safeParse(data.quiz);
    if (!quizParsed.success) {
      return fail(400, "invalid_quiz", {
        zodIssues: quizParsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    pushStep("persisting_quiz");
    const { error } = await persistQuizSubmission(
      admin!,
      owner!,
      detailsObj,
      quizParsed.data as unknown as Record<string, unknown>,
    );

    if (error) {
      console.error("[api/learn/content] quiz", error);
      return fail(500, "database_error", { databaseMessage: error.message });
    }

    const updatedAt = new Date().toISOString();
    const ladderStep =
      typeof detailsObj?.ladderStep === "string"
        ? detailsObj.ladderStep
        : typeof detailsObj?.step === "string"
          ? detailsObj.step
          : "start";
    const saved = buildContentSavedPayload(owner!, {
      classroomId: String(
        detailsObj?.classroomId ?? detailsObj?.classroom_id ?? DEFAULT_LEARN_CLASSROOM_ID,
      ),
      ladderStep,
      sceneIndex: Number(detailsObj?.sceneIndex ?? detailsObj?.scene_index) || 0,
      currentSceneId:
        typeof (detailsObj?.currentSceneId ?? detailsObj?.current_scene_id) === "string"
          ? String(detailsObj?.currentSceneId ?? detailsObj?.current_scene_id)
          : null,
      playbackCompleted: false,
      status: "quiz",
      updatedAt,
    });

    pushStep("quiz_success");
    return NextResponse.json(
      {
        ok: true,
        persisted: true,
        kind: "quiz",
        saved,
        ...(isDebugMode() ? { debug: { steps: debugSteps, ...debugMeta } } : {}),
      },
      {
        headers: {
          "X-Learn-Event": "quiz-updated",
        },
      },
    );
  }

  if (eventStatus === "progress" || eventStatus === "complete") {
    const playbackFields = extractPlaybackFields(eventStatus, detailsObj, rawObject);
    if (!playbackFields) return fail(400, "missing_classroom_id");

    pushStep("upserting_playback_progress");

    const existing = owner!.guestSessionId
      ? await admin!
          .from("learn_playback_progress")
          .select("details")
          .eq("guest_session_id", owner!.guestSessionId)
          .eq("classroom_id", playbackFields.classroomId)
          .maybeSingle()
      : await admin!
          .from("learn_playback_progress")
          .select("details")
          .eq("learner_id", owner!.learnerId!)
          .eq("classroom_id", playbackFields.classroomId)
          .maybeSingle();

    const { error } = await upsertPlaybackProgress(
      admin!,
      owner!,
      eventStatus,
      playbackFields,
      detailsObj,
      existing.data?.details,
    );

    if (error) {
      console.error("[api/learn/content] playback_progress", error);
      return fail(500, "database_error", { databaseMessage: error.message });
    }

    const updatedAt = new Date().toISOString();
    const ladderStep =
      typeof detailsObj?.ladderStep === "string"
        ? detailsObj.ladderStep
        : typeof detailsObj?.step === "string"
          ? detailsObj.step
          : "start";
    const saved = buildContentSavedPayload(owner!, {
      classroomId: playbackFields.classroomId,
      ladderStep,
      sceneIndex: playbackFields.sceneIndex,
      currentSceneId: playbackFields.currentSceneId,
      playbackCompleted: playbackFields.playbackCompleted,
      status: eventStatus,
      updatedAt,
    });

    pushStep("playback_success");
    return NextResponse.json({
      ok: true,
      persisted: true,
      kind: eventStatus,
      saved,
      ...(isDebugMode()
        ? { debug: { steps: debugSteps, classroomId: playbackFields.classroomId, ...debugMeta } }
        : {}),
    });
  }

  const resolvedLessonContentId =
    data.lessonContentId ??
    detailsObj?.lessonContentId ??
    detailsObj?.dbUnitId ??
    "unknown";

  const ownerId = learnerId ?? authData.user?.id ?? null;

  if (!ownerId) {
    pushStep("skip_guest_persist_no_owner");
    return NextResponse.json({
      ok: true,
      persisted: false,
      reason: "guest_without_db_user",
    });
  }

  if (!supabase) return fail(503, "supabase_not_configured");

  const legacyStatuses = new Set([
    "start",
    "slide_viewed",
    "quiz_started",
    "quiz_filled",
    "quiz_marks",
  ]);
  const legacyStatus = legacyStatuses.has(data.status) ? data.status : "start";

  const { error } = await supabase.from("lesson_content_status").upsert(
    {
      user_id: ownerId,
      guest_session_id: data.guestSessionId || null,
      lesson_content_id: String(resolvedLessonContentId),
      status: legacyStatus,
      details: data.details || {},
      quiz: data.quiz || {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_content_id" },
  );

  if (error?.code === "23503") {
    return NextResponse.json({ ok: true, persisted: false, reason: "fk_user_missing" });
  }
  if (error) {
    return fail(500, "database_error", { databaseMessage: error.message });
  }

  return NextResponse.json({ ok: true, persisted: true, kind: "legacy" });
}
