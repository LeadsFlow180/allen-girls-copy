import { DEFAULT_LEARN_CLASSROOM_ID } from "@/lib/learn/constants";
import { withDetailsUserId } from "@/lib/learn/content-owner";
import { ladderStepToIndex } from "@/lib/learn/ladder-steps";
import { buildPlaybackDetailsPatch } from "@/lib/learn/playback-progress";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient;

export type PlaybackOwner = {
  learnerId: string | null;
  guestSessionId: string | null;
};

export function resolvePlaybackOwner(
  learnerId: string | null,
  guestSessionId: string | null,
): PlaybackOwner | null {
  if (learnerId) return { learnerId, guestSessionId: null };
  if (guestSessionId) return { learnerId: null, guestSessionId };
  return null;
}

export type PlaybackFields = {
  classroomId: string;
  currentSceneId: string | null;
  sceneIndex: number;
  actionIndex: number;
  consumedDiscussions: unknown[];
  /** Current slide finished — resume checkpoint only. */
  playbackCompleted: boolean;
  /** Ladder mission finished (`status: complete` or explicit flag). */
  missionComplete: boolean;
};

export function extractPlaybackFields(
  status: "progress" | "complete",
  details: Record<string, unknown> | null,
  raw: Record<string, unknown> | null,
): PlaybackFields | null {
  const src = { ...(details ?? {}), ...(raw ?? {}) };
  const classroomId = String(
    src.classroomId ?? src.classroom_id ?? DEFAULT_LEARN_CLASSROOM_ID,
  ).trim();
  if (!classroomId) return null;

  const playbackCompletedExplicit =
    src.playbackCompleted ?? src.playback_completed;
  const playbackCompleted =
    typeof playbackCompletedExplicit === "boolean" ? playbackCompletedExplicit : false;

  const missionCompleteExplicit = src.missionComplete ?? src.mission_complete;
  const missionComplete =
    missionCompleteExplicit === true || status === "complete";

  return {
    classroomId,
    currentSceneId:
      typeof (src.currentSceneId ?? src.current_scene_id) === "string"
        ? String(src.currentSceneId ?? src.current_scene_id)
        : null,
    sceneIndex: Number.isFinite(Number(src.sceneIndex ?? src.scene_index))
      ? Number(src.sceneIndex ?? src.scene_index)
      : 0,
    actionIndex: Number.isFinite(Number(src.actionIndex ?? src.action_index))
      ? Number(src.actionIndex ?? src.action_index)
      : 0,
    consumedDiscussions: Array.isArray(
      src.consumedDiscussions ?? src.consumed_discussions,
    )
      ? (src.consumedDiscussions ?? src.consumed_discussions)
      : [],
    playbackCompleted,
    missionComplete,
  };
}

export async function upsertPlaybackProgress(
  admin: AdminClient,
  owner: PlaybackOwner,
  playbackStatus: "progress" | "complete",
  playbackFields: PlaybackFields,
  detailsObj: Record<string, unknown> | null,
  existingDetails: unknown,
) {
  const ladderStepRaw =
    typeof detailsObj?.ladderStep === "string"
      ? detailsObj.ladderStep
      : typeof detailsObj?.step === "string"
        ? detailsObj.step
        : "start";
  const ladderStepIndex = ladderStepToIndex(ladderStepRaw);
  const sectionId = Number(detailsObj?.sectionId ?? detailsObj?.section_id) || 1;
  const unitIndex = Number(detailsObj?.unitIndex ?? detailsObj?.unit_index) || 0;
  const dbSectionId =
    detailsObj?.dbSectionId != null
      ? Number(detailsObj.dbSectionId)
      : detailsObj?.db_section_id != null
        ? Number(detailsObj.db_section_id)
        : sectionId;
  const dbUnitId =
    detailsObj?.dbUnitId != null
      ? Number(detailsObj.dbUnitId)
      : detailsObj?.db_unit_id != null
        ? Number(detailsObj.db_unit_id)
        : unitIndex + 1;

  const mergedDetails = withDetailsUserId(
    buildPlaybackDetailsPatch(
      existingDetails,
      {
        ladderStep: ladderStepRaw,
        ladderStepIndex,
        sectionId,
        unitIndex,
        dbSectionId,
        dbUnitId,
        sceneIndex: playbackFields.sceneIndex,
        currentSceneId: playbackFields.currentSceneId,
        totalSlides:
          Number(detailsObj?.totalSlides ?? detailsObj?.total_slides) || undefined,
      },
      {
        missionComplete: playbackFields.missionComplete,
        playbackCompleted: playbackFields.playbackCompleted,
      },
    ),
    owner,
  );

  const playbackRow = {
    classroom_id: playbackFields.classroomId,
    current_scene_id: playbackFields.currentSceneId,
    scene_index: playbackFields.sceneIndex,
    action_index: playbackFields.actionIndex,
    consumed_discussions: playbackFields.consumedDiscussions,
    playback_completed: playbackFields.playbackCompleted,
    status: playbackStatus,
    db_section_id: dbSectionId,
    db_unit_id: dbUnitId,
    details: mergedDetails,
    updated_at: new Date().toISOString(),
  };

  if (owner.guestSessionId) {
    return admin.from("learn_playback_progress").upsert(
      {
        ...playbackRow,
        guest_session_id: owner.guestSessionId,
        learner_id: null,
      },
      { onConflict: "guest_session_id,classroom_id" },
    );
  }

  return admin.from("learn_playback_progress").upsert(
    {
      ...playbackRow,
      learner_id: owner.learnerId,
      guest_session_id: null,
    },
    { onConflict: "learner_id,classroom_id" },
  );
}

export async function persistQuizSubmission(
  admin: AdminClient,
  owner: PlaybackOwner,
  detailsObj: Record<string, unknown> | null,
  quiz: Record<string, unknown>,
) {
  const classroomId = String(
    detailsObj?.classroomId ??
      detailsObj?.classroom_id ??
      quiz.classroomId ??
      DEFAULT_LEARN_CLASSROOM_ID,
  );
  const ladderStep =
    typeof detailsObj?.ladderStep === "string"
      ? detailsObj.ladderStep
      : typeof detailsObj?.step === "string"
        ? detailsObj.step
        : null;
  const sceneIndex = Number(detailsObj?.sceneIndex ?? detailsObj?.scene_index) || 0;

  const fetchQuery = owner.guestSessionId
    ? admin
        .from("learn_playback_progress")
        .select("details")
        .eq("guest_session_id", owner.guestSessionId)
        .eq("classroom_id", classroomId)
        .maybeSingle()
    : admin
        .from("learn_playback_progress")
        .select("details")
        .eq("learner_id", owner.learnerId!)
        .eq("classroom_id", classroomId)
        .maybeSingle();

  let sectionId = Number(detailsObj?.sectionId ?? detailsObj?.section_id);
  let unitIndex = Number(detailsObj?.unitIndex ?? detailsObj?.unit_index);
  if (!Number.isFinite(sectionId) || !Number.isFinite(unitIndex)) {
    const { data: existingRow } = await fetchQuery;
    const prev =
      typeof existingRow?.details === "object" && existingRow.details
        ? (existingRow.details as Record<string, unknown>)
        : {};
    const ctx = prev.activeContext as Record<string, unknown> | undefined;
    if (!Number.isFinite(sectionId)) {
      sectionId = Number(ctx?.sectionId ?? prev.sectionId) || 1;
    }
    if (!Number.isFinite(unitIndex)) {
      unitIndex = Number(ctx?.unitIndex ?? prev.unitIndex) || 0;
    }
  }

  const submittedAt =
    typeof quiz.submittedAt === "string"
      ? quiz.submittedAt
      : new Date().toISOString();

  const insertRow = {
    guest_session_id: owner.guestSessionId,
    learner_id: owner.learnerId,
    classroom_id: classroomId,
    scene_id: String(quiz.sceneId ?? detailsObj?.currentSceneId ?? ""),
    ladder_step: ladderStep,
    scene_index: sceneIndex,
    section_id: sectionId,
    unit_index: unitIndex,
    quiz,
    submitted_at: submittedAt,
  };

  const { error: insertError } = await admin
    .from("learn_quiz_submissions")
    .insert(insertRow);

  if (insertError) {
    return { error: insertError };
  }

  const lastQuizPatch = {
    lastQuiz: {
      ...quiz,
      ladderStep,
      sceneIndex,
      recordedAt: new Date().toISOString(),
    },
  };

  const { data: existing } = await fetchQuery;
  const prevDetails =
    typeof existing?.details === "object" && existing.details
      ? existing.details
      : {};

  const mergedDetails = withDetailsUserId(
    {
      ...(prevDetails as Record<string, unknown>),
      ...lastQuizPatch,
    },
    owner,
  );

  const patchRow = {
    quiz,
    details: mergedDetails,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const updateQuery = owner.guestSessionId
      ? admin
          .from("learn_playback_progress")
          .update(patchRow)
          .eq("guest_session_id", owner.guestSessionId)
          .eq("classroom_id", classroomId)
      : admin
          .from("learn_playback_progress")
          .update(patchRow)
          .eq("learner_id", owner.learnerId!)
          .eq("classroom_id", classroomId);

    const { error: updateError } = await updateQuery;
    if (updateError) return { error: updateError };
  }

  return { error: null };
}
