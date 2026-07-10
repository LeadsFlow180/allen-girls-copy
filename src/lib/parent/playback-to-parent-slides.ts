import { SLIDES_PER_CLASSROOM } from "@/lib/learn/constants";
import { ladderIndexToStep, ladderStepToIndex } from "@/lib/learn/ladder-steps";
import {
  isRowMissionComplete,
  isStepMissionComplete,
  normalizePlaybackDetails,
  parseActiveContext,
  parseStepProgressMap,
} from "@/lib/learn/playback-step-progress";
import type { ParentDashboardSlide } from "@/lib/parent/parent-dashboard-types";
import { parsePlaybackDetails } from "@/lib/parent/parent-progress-labels";

type PlaybackRow = {
  classroom_id: string;
  current_scene_id: string | null;
  scene_index: number | null;
  action_index: number | null;
  status: string | null;
  playback_completed: boolean | null;
  updated_at: string;
  details: unknown;
};

function parseTotalSlides(details: unknown): number {
  const d = normalizePlaybackDetails(details);
  if (!d) return SLIDES_PER_CLASSROOM;
  const raw = d.totalSlides ?? d.total_slides;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : SLIDES_PER_CLASSROOM;
}

function parseStepKey(key: string): {
  sectionId: number;
  unitIndex: number;
  ladderStepIndex: number;
} | null {
  const parts = key.split(":");
  if (parts.length !== 3) return null;
  const sectionId = Number(parts[0]);
  const unitIndex = Number(parts[1]);
  const ladderStepIndex = Number(parts[2]);
  if (
    !Number.isFinite(sectionId) ||
    !Number.isFinite(unitIndex) ||
    !Number.isFinite(ladderStepIndex)
  ) {
    return null;
  }
  return { sectionId, unitIndex, ladderStepIndex };
}

/**
 * Expands one `learn_playback_progress` row into parent-friendly slide entries.
 * Uses `details.stepProgress` (same map as Explore) for section/unit/mission indices.
 */
export function playbackRowToParentSlides(row: PlaybackRow): ParentDashboardSlide[] {
  const stepProgress = parseStepProgressMap(row.details);
  const keys = Object.keys(stepProgress);
  const rowUpdatedAt = row.updated_at;
  const classroomId = row.classroom_id;
  const totalSlides = parseTotalSlides(row.details);

  if (keys.length > 0) {
    const slides: ParentDashboardSlide[] = [];
    for (const key of keys) {
      const coords = parseStepKey(key);
      if (!coords) continue;
      const state = stepProgress[key];
      if (!state) continue;
      const missionComplete = isStepMissionComplete(state);
      slides.push({
        classroomId,
        currentSceneId: state.currentSceneId,
        sceneIndex: state.sceneIndex,
        actionIndex: (row.action_index as number) ?? 0,
        status: missionComplete ? "complete" : ((row.status as string) ?? "progress"),
        playbackCompleted: state.playbackCompleted,
        missionComplete,
        totalSlides,
        updatedAt: state.updatedAt ?? rowUpdatedAt,
        sectionId: coords.sectionId,
        unitIndex: coords.unitIndex,
        ladderStep: ladderIndexToStep(coords.ladderStepIndex),
        ladderStepIndex: coords.ladderStepIndex,
      });
    }
    slides.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return slides;
  }

  const meta = parsePlaybackDetails(row.details);
  const active = parseActiveContext(row.details);
  const sectionId = active?.sectionId ?? meta.sectionId;
  const unitIndex = active?.unitIndex ?? meta.unitIndex;
  const ladderStepIndex =
    active?.ladderStepIndex ??
    (meta.ladderStep != null ? ladderStepToIndex(meta.ladderStep) : null);
  const ladderStep =
    active?.ladderStep ??
    meta.ladderStep ??
    (ladderStepIndex != null ? ladderIndexToStep(ladderStepIndex) : null);
  const missionComplete = isRowMissionComplete(row.status, row.details);

  return [
    {
      classroomId,
      currentSceneId: (row.current_scene_id as string | null) ?? null,
      sceneIndex: (row.scene_index as number) ?? 0,
      actionIndex: (row.action_index as number) ?? 0,
      status: (row.status as string) ?? "progress",
      playbackCompleted: Boolean(row.playback_completed),
      missionComplete,
      totalSlides,
      updatedAt: rowUpdatedAt,
      sectionId,
      unitIndex,
      ladderStep,
      ladderStepIndex: ladderStepIndex ?? null,
    },
  ];
}
