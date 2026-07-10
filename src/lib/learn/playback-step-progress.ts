import { LADDER_STEPS_PER_UNIT, SLIDES_PER_CLASSROOM } from "@/lib/learn/constants";
import { ladderIndexToStep, ladderStepToIndex } from "@/lib/learn/ladder-steps";

/** One classroom session = one ladder step within a unit (shared classroom id). */
export type StepPlaybackState = {
  sceneIndex: number;
  currentSceneId: string | null;
  /** Current slide finished — resume checkpoint only (not mission done). */
  playbackCompleted: boolean;
  /** Ladder mission / classroom session finished for this step. */
  missionComplete?: boolean;
  updatedAt?: string;
};

/** Mission done: explicit flag, row status, or legacy step data before missionComplete existed. */
export function isStepMissionComplete(state: StepPlaybackState | undefined): boolean {
  if (!state) return false;
  if (state.missionComplete === true) return true;
  if (state.missionComplete === false) return false;
  // Legacy rows stored mission completion in playbackCompleted.
  return state.playbackCompleted === true;
}

export function isRowMissionComplete(
  status: string | null | undefined,
  details: unknown,
): boolean {
  if (status === "complete") return true;
  const d = normalizePlaybackDetails(details);
  if (!d) return false;
  const flag = d.missionComplete ?? d.mission_complete;
  return flag === true;
}

export type StepProgressMap = Record<string, StepPlaybackState>;

export type ActivePlaybackContext = {
  sectionId: number;
  unitIndex: number;
  ladderStepIndex: number;
  ladderStep?: string;
  dbSectionId?: number | null;
  dbUnitId?: number | null;
};

export function makeStepProgressKey(
  sectionId: number,
  unitIndex: number,
  ladderStepIndex: number,
): string {
  return `${sectionId}:${unitIndex}:${ladderStepIndex}`;
}

/** Supabase may return jsonb as object; some rows store details as a JSON string. */
export function normalizePlaybackDetails(details: unknown): Record<string, unknown> | null {
  if (!details) return null;
  if (typeof details === "string") {
    try {
      return normalizePlaybackDetails(JSON.parse(details));
    } catch {
      return null;
    }
  }
  if (typeof details === "object" && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }
  return null;
}

export function parseStepProgressMap(details: unknown): StepProgressMap {
  const d = normalizePlaybackDetails(details);
  if (!d) return {};
  const raw = d.stepProgress;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const map: StepProgressMap = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const v = value as Record<string, unknown>;
    map[key] = {
      sceneIndex: Number.isFinite(Number(v.sceneIndex))
        ? Number(v.sceneIndex)
        : 0,
      currentSceneId:
        typeof v.currentSceneId === "string" ? v.currentSceneId : null,
      playbackCompleted: Boolean(v.playbackCompleted),
      missionComplete:
        typeof v.missionComplete === "boolean"
          ? v.missionComplete
          : typeof v.mission_complete === "boolean"
            ? v.mission_complete
            : undefined,
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : undefined,
    };
  }
  return map;
}

export function parseActiveContext(details: unknown): ActivePlaybackContext | null {
  const d = normalizePlaybackDetails(details);
  if (!d) return null;
  const ctx = d.activeContext;
  if (ctx && typeof ctx === "object" && !Array.isArray(ctx)) {
    const c = ctx as Record<string, unknown>;
    const sectionId = Number(c.sectionId);
    const unitIndex = Number(c.unitIndex);
    const ladderStepIndex = Number(c.ladderStepIndex);
    if (
      Number.isFinite(sectionId) &&
      Number.isFinite(unitIndex) &&
      Number.isFinite(ladderStepIndex)
    ) {
      return {
        sectionId,
        unitIndex,
        ladderStepIndex,
        ladderStep:
          typeof c.ladderStep === "string" ? c.ladderStep : undefined,
        dbSectionId:
          c.dbSectionId != null ? Number(c.dbSectionId) : null,
        dbUnitId: c.dbUnitId != null ? Number(c.dbUnitId) : null,
      };
    }
  }

  const sectionId = Number(d.sectionId);
  const unitIndex = Number(d.unitIndex);
  const ladderStepIndex =
    typeof d.ladderStepIndex === "number"
      ? d.ladderStepIndex
      : ladderStepToIndex(
          typeof d.ladderStep === "string"
            ? d.ladderStep
            : typeof d.step === "string"
              ? d.step
              : undefined,
        );

  if (!Number.isFinite(sectionId) || !Number.isFinite(unitIndex)) {
    return null;
  }

  return {
    sectionId,
    unitIndex,
    ladderStepIndex: Math.min(
      LADDER_STEPS_PER_UNIT - 1,
      Math.max(0, ladderStepIndex),
    ),
    ladderStep:
      typeof d.ladderStep === "string"
        ? d.ladderStep
        : typeof d.step === "string"
          ? d.step
          : undefined,
    dbSectionId:
      d.dbSectionId != null
        ? Number(d.dbSectionId)
        : d.db_section_id != null
          ? Number(d.db_section_id)
          : null,
    dbUnitId:
      d.dbUnitId != null
        ? Number(d.dbUnitId)
        : d.db_unit_id != null
          ? Number(d.db_unit_id)
          : null,
  };
}

export function countCompletedStepsForUnit(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitIndex: number,
): number {
  let count = 0;
  for (let i = 0; i < LADDER_STEPS_PER_UNIT; i++) {
    const key = makeStepProgressKey(sectionId, unitIndex, i);
    if (isStepMissionComplete(stepProgress[key])) count += 1;
  }
  return count;
}

/** 0..1 progress for one ladder step (mission complete = 1, else slide fraction). */
export function stepMissionProgressFraction(
  state: StepPlaybackState | undefined,
  totalSlides = SLIDES_PER_CLASSROOM,
): number {
  if (!state) return 0;
  if (isStepMissionComplete(state)) return 1;
  const total = Math.max(1, totalSlides);
  if (state.sceneIndex > 0 || state.playbackCompleted || state.currentSceneId) {
    return Math.min(0.99, (state.sceneIndex + 1) / total);
  }
  return 0;
}

/** Sum of per-mission fractions in one unit (0..5). */
export function countUnitProgressFraction(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitIndex: number,
  totalSlides = SLIDES_PER_CLASSROOM,
): number {
  let sum = 0;
  for (let i = 0; i < LADDER_STEPS_PER_UNIT; i++) {
    sum += stepMissionProgressFraction(
      stepProgress[makeStepProgressKey(sectionId, unitIndex, i)],
      totalSlides,
    );
  }
  return sum;
}

/** Sum of per-mission fractions across all units in a section. */
export function countSectionProgressFraction(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitsInSection: number,
  totalSlides = SLIDES_PER_CLASSROOM,
): number {
  const totalUnits = Math.max(1, unitsInSection);
  let sum = 0;
  for (let unitIndex = 0; unitIndex < totalUnits; unitIndex++) {
    sum += countUnitProgressFraction(stepProgress, sectionId, unitIndex, totalSlides);
  }
  return sum;
}

/** First ladder index that is not mission-complete (includes in-progress missions). */
export function resolveCurrentLadderStepInUnit(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitIndex: number,
): number {
  for (let i = 0; i < LADDER_STEPS_PER_UNIT; i++) {
    if (!isStepMissionComplete(stepProgress[makeStepProgressKey(sectionId, unitIndex, i)])) {
      return i;
    }
  }
  return LADDER_STEPS_PER_UNIT;
}

/** Count completed ladder steps in a section across all units (for section card %). */
export function countCompletedStepsInSection(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitsInSection: number,
): number {
  const totalUnits = Math.max(1, unitsInSection);
  let count = 0;
  for (let unitIndex = 0; unitIndex < totalUnits; unitIndex++) {
    count += countCompletedStepsForUnit(stepProgress, sectionId, unitIndex);
  }
  return count;
}

export function countCompletedStepsInDetails(
  details: unknown,
  sectionId = 1,
  unitsInSection = 10,
): number {
  return countCompletedStepsInSection(
    parseStepProgressMap(details),
    sectionId,
    unitsInSection,
  );
}

/** First unit in the section that still has ladder steps left. */
export function resolveSectionExploreProgress(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitsInSection: number,
): { currentUnit: number; currentStep: number } {
  const totalUnits = Math.max(1, unitsInSection);
  for (let unitIndex = 0; unitIndex < totalUnits; unitIndex++) {
    const completed = countCompletedStepsForUnit(
      stepProgress,
      sectionId,
      unitIndex,
    );
    if (completed < LADDER_STEPS_PER_UNIT) {
      return {
        currentUnit: unitIndex,
        currentStep: resolveCurrentLadderStepInUnit(stepProgress, sectionId, unitIndex),
      };
    }
  }
  return {
    currentUnit: totalUnits - 1,
    currentStep: LADDER_STEPS_PER_UNIT,
  };
}

export function getStepState(
  stepProgress: StepProgressMap,
  sectionId: number,
  unitIndex: number,
  ladderStepIndex: number,
): StepPlaybackState | null {
  return stepProgress[makeStepProgressKey(sectionId, unitIndex, ladderStepIndex)] ?? null;
}

export function ladderStepLabel(index: number): string {
  return ladderIndexToStep(index);
}
