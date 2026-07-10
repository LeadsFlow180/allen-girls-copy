import {
  DEFAULT_LEARN_CLASSROOM_ID,
  DEFAULT_UNITS_PER_SECTION,
  LADDER_STEPS_PER_UNIT,
  SLIDES_PER_CLASSROOM,
} from "@/lib/learn/constants";
import {
  ladderIndexToStep,
  ladderStepToIndex,
  type LadderStepKind,
} from "@/lib/learn/ladder-steps";
import {
  countCompletedStepsForUnit,
  countSectionProgressFraction,
  countUnitProgressFraction,
  isRowMissionComplete,
  isStepMissionComplete,
  makeStepProgressKey,
  normalizePlaybackDetails,
  parseActiveContext,
  parseStepProgressMap,
  resolveSectionExploreProgress,
  type StepProgressMap,
} from "@/lib/learn/playback-step-progress";

export type PlaybackProgressRow = {
  guest_session_id?: string | null;
  learner_id?: string | null;
  db_section_id?: number | null;
  db_unit_id?: number | null;
  classroom_id?: string | null;
  current_scene_id?: string | null;
  scene_index?: number | null;
  action_index?: number | null;
  playback_completed?: boolean | null;
  status?: string | null;
  last_played_at?: string | null;
  updated_at?: string | null;
  details?: unknown;
  quiz?: unknown;
};

export type PlaybackDetailsMeta = {
  ladderStep?: LadderStepKind | string;
  ladderStepIndex?: number;
  completedLadderSteps?: number;
  totalSlides?: number;
  sectionId?: number;
  unitIndex?: number;
};

export type SectionExploreProgress = {
  sectionId: number;
  currentUnit: number;
  currentStep: number;
};

export type MappedUnitPlayback = {
  classroomId: string;
  sectionId: number;
  unitIndex: number;
  /** 0..5 — how many ladder missions fully completed in this unit */
  completedLadderSteps: number;
  /** 0..4 — active ladder mission index */
  ladderStepIndex: number;
  ladderStep: LadderStepKind;
  /** 0..4 — maps to Explore path currentStep */
  currentStep: number;
  /** Slide index to resume inside classroom (0-based) */
  sceneIndex: number;
  currentSceneId: string | null;
  totalSlides: number;
  /** % within current classroom session (slides) */
  slidePercent: number;
  /** % for current unit only (5 missions × slides) */
  unitPercent: number;
  /** @deprecated alias — use unitPercent */
  percent: number;
  /** % across all units in the section (e.g. 10 units) */
  sectionPercent: number;
  unitsInSection: number;
  /** Current slide finished — resume checkpoint (not mission done). */
  playbackCompleted: boolean;
  /** Ladder mission / classroom session finished for the active step. */
  missionComplete: boolean;
  /** All 5 ladder missions done → advance to next unit */
  unitComplete: boolean;
  statusLabel: string;
};

function parseDetailsMeta(details: unknown): PlaybackDetailsMeta {
  const d = normalizePlaybackDetails(details);
  if (!d) return {};
  return {
    ladderStep:
      typeof d.ladderStep === "string"
        ? d.ladderStep
        : typeof d.step === "string"
          ? d.step
          : undefined,
    ladderStepIndex:
      typeof d.ladderStepIndex === "number"
        ? d.ladderStepIndex
        : Number.isFinite(Number(d.ladder_step_index))
          ? Number(d.ladder_step_index)
          : undefined,
    completedLadderSteps:
      typeof d.completedLadderSteps === "number"
        ? d.completedLadderSteps
        : Number.isFinite(Number(d.completed_ladder_steps))
          ? Number(d.completed_ladder_steps)
          : undefined,
    totalSlides:
      typeof d.totalSlides === "number"
        ? d.totalSlides
        : Number.isFinite(Number(d.total_slides))
          ? Number(d.total_slides)
          : undefined,
    sectionId:
      typeof d.sectionId === "number"
        ? d.sectionId
        : Number.isFinite(Number(d.sectionId))
          ? Number(d.sectionId)
          : undefined,
    unitIndex:
      typeof d.unitIndex === "number"
        ? d.unitIndex
        : Number.isFinite(Number(d.unitIndex))
          ? Number(d.unitIndex)
          : undefined,
  };
}

/** Section % from a playback row (uses full stepProgress map when present). */
export function getPlaybackSectionPercent(
  row: PlaybackProgressRow | null | undefined,
  options?: { unitsInSection?: number },
): number {
  const mapped = mapPlaybackRowToUnitProgress(row, options);
  return mapped?.sectionPercent ?? 0;
}

/** Section card % = (finished units + fraction of current unit) / total units. */
export function computeSectionProgressPercent(
  unitIndex: number,
  unitLevelPercent: number,
  totalUnitsInSection: number,
): number {
  if (totalUnitsInSection <= 0) return unitLevelPercent;
  const fraction =
    (Math.max(0, unitIndex) + unitLevelPercent / 100) / totalUnitsInSection;
  return Math.min(100, Math.round(fraction * 100));
}

/** Where the learner is on the section map (derived from per-step progress). */
export function mapSectionExploreProgress(
  row: PlaybackProgressRow | null | undefined,
  options?: { unitsInSection?: number },
): SectionExploreProgress | null {
  if (!row) return null;

  const meta = parseDetailsMeta(row.details);
  const stepProgress = parseStepProgressMap(row.details);
  const sectionId =
    row.db_section_id != null && row.db_section_id > 0
      ? Number(row.db_section_id)
      : (meta.sectionId ?? 1);
  const unitsInSection = Math.max(
    1,
    options?.unitsInSection ?? DEFAULT_UNITS_PER_SECTION,
  );

  const hasStepMap = Object.keys(stepProgress).length > 0;
  if (hasStepMap) {
    const { currentUnit, currentStep } = resolveSectionExploreProgress(
      stepProgress,
      sectionId,
      unitsInSection,
    );
    return { sectionId, currentUnit, currentStep };
  }

  const unitIndex =
    row.db_unit_id != null && row.db_unit_id > 0
      ? Number(row.db_unit_id) - 1
      : (meta.unitIndex ?? 0);
  let completedLadderSteps = Math.min(
    LADDER_STEPS_PER_UNIT,
    Math.max(0, meta.completedLadderSteps ?? 0),
  );
  if (isRowMissionComplete(row.status, row.details)) {
    const ladderStepIndex =
      meta.ladderStepIndex ?? ladderStepToIndex(meta.ladderStep as string);
    completedLadderSteps = Math.max(
      completedLadderSteps,
      Math.min(LADDER_STEPS_PER_UNIT, ladderStepIndex + 1),
    );
  }

  let currentUnit = Math.max(0, unitIndex);
  let currentStep = completedLadderSteps;
  if (completedLadderSteps >= LADDER_STEPS_PER_UNIT && currentUnit < unitsInSection - 1) {
    currentUnit += 1;
    currentStep = 0;
  }

  return { sectionId, currentUnit, currentStep };
}

/** Maps DB row → Explore ladder + slide resume state for one unit. */
export function mapPlaybackRowToUnitProgress(
  row: PlaybackProgressRow | null | undefined,
  options?: { unitsInSection?: number; unitIndex?: number },
): MappedUnitPlayback | null {
  if (!row) return null;

  const meta = parseDetailsMeta(row.details);
  const stepProgress = parseStepProgressMap(row.details);
  const activeContext = parseActiveContext(row.details);
  const sectionId =
    row.db_section_id != null && row.db_section_id > 0
      ? Number(row.db_section_id)
      : (meta.sectionId ?? activeContext?.sectionId ?? 1);

  const unitsInSection = Math.max(
    1,
    options?.unitsInSection ?? DEFAULT_UNITS_PER_SECTION,
  );

  const explore =
    mapSectionExploreProgress(row, { unitsInSection }) ??
    ({ sectionId, currentUnit: 0, currentStep: 0 } satisfies SectionExploreProgress);

  const unitIndex =
    options?.unitIndex ?? explore.currentUnit;

  const totalSlides = Math.max(
    1,
    meta.totalSlides ?? SLIDES_PER_CLASSROOM,
  );

  const hasStepMap = Object.keys(stepProgress).length > 0;
  let completedLadderSteps = hasStepMap
    ? countCompletedStepsForUnit(stepProgress, sectionId, unitIndex)
    : unitIndex === explore.currentUnit
      ? Math.min(
          LADDER_STEPS_PER_UNIT,
          Math.max(0, explore.currentStep),
        )
      : unitIndex < explore.currentUnit
        ? LADDER_STEPS_PER_UNIT
        : 0;

  if (!hasStepMap && unitIndex === (row.db_unit_id != null && row.db_unit_id > 0
      ? Number(row.db_unit_id) - 1
      : (meta.unitIndex ?? 0))) {
    let legacyCompleted = Math.min(
      LADDER_STEPS_PER_UNIT,
      Math.max(0, meta.completedLadderSteps ?? 0),
    );
    const ladderStepIndex =
      meta.ladderStepIndex ?? ladderStepToIndex(meta.ladderStep as string);
    if (isRowMissionComplete(row.status, row.details)) {
      legacyCompleted = Math.max(legacyCompleted, ladderStepIndex + 1);
    }
    completedLadderSteps = legacyCompleted;
  }

  const unitComplete = completedLadderSteps >= LADDER_STEPS_PER_UNIT;

  let activeLadderIndex = unitComplete
    ? LADDER_STEPS_PER_UNIT - 1
    : Math.min(
        LADDER_STEPS_PER_UNIT - 1,
        Math.max(0, completedLadderSteps),
      );

  if (
    unitIndex === explore.currentUnit &&
    explore.currentStep < LADDER_STEPS_PER_UNIT
  ) {
    activeLadderIndex = explore.currentStep;
  }

  const stepKey = makeStepProgressKey(sectionId, unitIndex, activeLadderIndex);
  const stepState = stepProgress[stepKey];
  const missionComplete = hasStepMap
    ? isStepMissionComplete(stepState)
    : isRowMissionComplete(row.status, row.details) &&
      unitIndex ===
        (row.db_unit_id != null && row.db_unit_id > 0
          ? Number(row.db_unit_id) - 1
          : (meta.unitIndex ?? 0));
  const slidePlaybackCompleted = hasStepMap
    ? Boolean(stepState?.playbackCompleted)
    : Boolean(row.playback_completed);

  const sceneIndex = hasStepMap
    ? Math.max(
        0,
        Math.min(
          totalSlides - 1,
          stepState?.sceneIndex ?? (Number(row.scene_index) || 0),
        ),
      )
    : Math.max(
        0,
        Math.min(totalSlides - 1, Number(row.scene_index) || 0),
      );

  const currentStep = unitComplete
    ? LADDER_STEPS_PER_UNIT
    : missionComplete
      ? completedLadderSteps
      : activeLadderIndex;

  const slidePercent = missionComplete
    ? 100
    : Math.min(
        99,
        Math.round(((sceneIndex + 1) / totalSlides) * 100),
      );

  const unitPercent = hasStepMap
    ? Math.min(
        100,
        Math.round(
          (countUnitProgressFraction(stepProgress, sectionId, unitIndex, totalSlides) /
            LADDER_STEPS_PER_UNIT) *
            100,
        ),
      )
    : unitComplete
      ? 100
      : Math.min(
          99,
          Math.round(
            (completedLadderSteps / LADDER_STEPS_PER_UNIT) * 100 +
              slidePercent / LADDER_STEPS_PER_UNIT,
          ),
        );

  const sectionPercent = hasStepMap
    ? Math.min(
        100,
        Math.round(
          (countSectionProgressFraction(stepProgress, sectionId, unitsInSection, totalSlides) /
            (unitsInSection * LADDER_STEPS_PER_UNIT)) *
            100,
        ),
      )
    : computeSectionProgressPercent(
        Math.max(0, unitIndex),
        unitPercent,
        unitsInSection,
      );

  const ladderStep = ladderIndexToStep(activeLadderIndex);
  const statusLabel = unitComplete
    ? "Unit complete · next unit unlocked"
    : missionComplete
      ? `Mission ${completedLadderSteps}/${LADDER_STEPS_PER_UNIT} done · open next`
      : `Slide ${sceneIndex + 1} of ${totalSlides} · Part ${activeLadderIndex + 1}/${LADDER_STEPS_PER_UNIT}`;

  return {
    classroomId: row.classroom_id ?? DEFAULT_LEARN_CLASSROOM_ID,
    sectionId,
    unitIndex: Math.max(0, unitIndex),
    completedLadderSteps,
    ladderStepIndex: activeLadderIndex,
    ladderStep,
    currentStep,
    sceneIndex,
    currentSceneId:
      (hasStepMap ? stepState?.currentSceneId : null) ??
      row.current_scene_id ??
      null,
    totalSlides,
    slidePercent,
    unitPercent,
    percent: unitPercent,
    sectionPercent,
    unitsInSection,
    playbackCompleted: slidePlaybackCompleted,
    missionComplete,
    unitComplete,
    statusLabel,
  };
}

/** Build details JSON persisted on each AI School progress callback. */
export function buildPlaybackDetailsPatch(
  existing: unknown,
  patch: PlaybackDetailsMeta & {
    sectionId?: number;
    unitIndex?: number;
    dbSectionId?: number | null;
    dbUnitId?: number | null;
    sceneIndex?: number;
    currentSceneId?: string | null;
  },
  opts: { missionComplete: boolean; playbackCompleted: boolean },
): Record<string, unknown> {
  const prev = parseDetailsMeta(existing);
  const prevRaw =
    typeof existing === "object" && existing && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};
  const stepProgress: StepProgressMap = {
    ...parseStepProgressMap(existing),
  };

  const ladderStep = patch.ladderStep ?? prev.ladderStep ?? "start";
  const ladderStepIndex =
    patch.ladderStepIndex ??
    ladderStepToIndex(String(ladderStep)) ??
    prev.ladderStepIndex ??
    0;
  const sectionId = patch.sectionId ?? prev.sectionId ?? 1;
  const unitIndex = patch.unitIndex ?? prev.unitIndex ?? 0;
  const stepKey = makeStepProgressKey(sectionId, unitIndex, ladderStepIndex);
  const prevStep = stepProgress[stepKey];

  stepProgress[stepKey] = {
    sceneIndex:
      patch.sceneIndex ??
      prevStep?.sceneIndex ??
      0,
    currentSceneId:
      patch.currentSceneId ?? prevStep?.currentSceneId ?? null,
    playbackCompleted: opts.playbackCompleted,
    missionComplete: opts.missionComplete || Boolean(prevStep?.missionComplete),
    updatedAt: new Date().toISOString(),
  };

  const completedLadderSteps = countCompletedStepsForUnit(
    stepProgress,
    sectionId,
    unitIndex,
  );

  return {
    ...prevRaw,
    classroomId: DEFAULT_LEARN_CLASSROOM_ID,
    ladderStep,
    ladderStepIndex,
    completedLadderSteps,
    totalSlides: patch.totalSlides ?? prev.totalSlides ?? SLIDES_PER_CLASSROOM,
    sectionId,
    unitIndex,
    dbSectionId: patch.dbSectionId ?? null,
    dbUnitId: patch.dbUnitId ?? null,
    stepProgress,
    activeContext: {
      sectionId,
      unitIndex,
      ladderStepIndex,
      ladderStep,
      dbSectionId: patch.dbSectionId ?? null,
      dbUnitId: patch.dbUnitId ?? null,
    },
  };
}
