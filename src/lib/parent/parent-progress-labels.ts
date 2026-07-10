import {
  DEFAULT_LEARN_CLASSROOM_ID,
  LADDER_STEPS_PER_UNIT,
  SLIDES_PER_CLASSROOM,
} from "@/lib/learn/constants";
import { ladderStepToIndex } from "@/lib/learn/ladder-steps";
import type { ParentDashboardQuiz, ParentDashboardSlide } from "@/lib/parent/parent-dashboard-types";

/** Same chip as Explore unit cards: `Slide 1/5 · mission 5/5`. */
export function formatExploreSlideMissionChip(
  sceneIndex: number,
  ladderStepIndex: number,
  options?: { totalSlides?: number; ladderSteps?: number },
): string {
  const totalSlides = options?.totalSlides ?? SLIDES_PER_CLASSROOM;
  const ladderSteps = options?.ladderSteps ?? LADDER_STEPS_PER_UNIT;
  return `Slide ${sceneIndex + 1}/${totalSlides} · mission ${ladderStepIndex + 1}/${ladderSteps}`;
}

const LADDER_STEP_TITLES: Record<string, string> = {
  start: "Getting started",
  lesson: "Lesson",
  chest: "Treasure chest",
  practice: "Practice",
  review: "Review",
};

export function formatLadderStepTitle(step: string | null | undefined): string | null {
  if (!step) return null;
  return LADDER_STEP_TITLES[step] ?? step.charAt(0).toUpperCase() + step.slice(1);
}

export function formatClassroomTitle(classroomId: string): string {
  if (classroomId === DEFAULT_LEARN_CLASSROOM_ID) {
    return "Allen Girls interactive lesson";
  }
  return "Lesson activity";
}

export function parsePlaybackDetails(details: unknown): {
  sectionId: number | null;
  unitIndex: number | null;
  ladderStep: string | null;
} {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return { sectionId: null, unitIndex: null, ladderStep: null };
  }
  const d = details as Record<string, unknown>;
  const ctx =
    typeof d.activeContext === "object" && d.activeContext && !Array.isArray(d.activeContext)
      ? (d.activeContext as Record<string, unknown>)
      : null;

  const sectionRaw = d.sectionId ?? d.section_id ?? ctx?.sectionId;
  const unitRaw = d.unitIndex ?? d.unit_index ?? ctx?.unitIndex;
  const ladderRaw =
    typeof d.ladderStep === "string"
      ? d.ladderStep
      : typeof d.step === "string"
        ? d.step
        : null;

  const sectionId = Number(sectionRaw);
  const unitIndex = Number(unitRaw);

  return {
    sectionId: Number.isFinite(sectionId) ? sectionId : null,
    unitIndex: Number.isFinite(unitIndex) ? unitIndex : null,
    ladderStep: ladderRaw,
  };
}

export function formatSlideActivityLabel(
  slide: ParentDashboardSlide,
  options?: {
    sectionId?: number | null;
    unitIndex?: number | null;
    ladderStep?: string | null;
    ladderStepIndex?: number | null;
  },
): string {
  const parts: string[] = [formatClassroomTitle(slide.classroomId)];

  if (options?.sectionId != null) {
    parts.push(`Section ${options.sectionId}`);
  }
  if (options?.unitIndex != null) {
    parts.push(`Unit ${options.unitIndex + 1}`);
  }

  const ladderIdx =
    options?.ladderStepIndex ??
    slide.ladderStepIndex ??
    (options?.ladderStep ?? slide.ladderStep
      ? ladderStepToIndex(options?.ladderStep ?? slide.ladderStep)
      : null);

  const totalSlides =
    slide.totalSlides > 0 ? slide.totalSlides : SLIDES_PER_CLASSROOM;

  if (ladderIdx != null && Number.isFinite(ladderIdx)) {
    parts.push(
      formatExploreSlideMissionChip(slide.sceneIndex, ladderIdx, { totalSlides }),
    );
  } else {
    parts.push(`Slide ${slide.sceneIndex + 1}/${totalSlides}`);
  }

  return parts.join(" · ");
}

export function formatQuizActivityLabel(quiz: ParentDashboardQuiz): string {
  const parts: string[] = [
    `${quiz.percent}%`,
    `${quiz.correctCount}/${quiz.questionCount} correct`,
  ];

  if (quiz.sectionId != null) {
    parts.push(`Section ${quiz.sectionId}`);
  }
  if (quiz.unitIndex != null) {
    parts.push(`Unit ${quiz.unitIndex + 1}`);
  }

  const stepTitle = formatLadderStepTitle(quiz.ladderStep);
  if (stepTitle) {
    parts.push(stepTitle);
  } else {
    parts.push("Quiz round");
  }

  return parts.join(" · ");
}

export function isSlideMissionComplete(slide: ParentDashboardSlide): boolean {
  if (slide.missionComplete) return true;
  return slide.status === "complete";
}

export function formatSlideStatus(slide: ParentDashboardSlide): string {
  if (isSlideMissionComplete(slide)) return "Complete";
  if (slide.playbackCompleted) return "Slide checkpoint";
  return "In progress";
}
