export const LADDER_STEP_KINDS = [
  "start",
  "lesson",
  "chest",
  "practice",
  "review",
] as const;

export type LadderStepKind = (typeof LADDER_STEP_KINDS)[number];

export function ladderStepToIndex(step: string | null | undefined): number {
  if (!step) return 0;
  const idx = LADDER_STEP_KINDS.indexOf(step as LadderStepKind);
  return idx >= 0 ? idx : 0;
}

export function ladderIndexToStep(index: number): LadderStepKind {
  return LADDER_STEP_KINDS[Math.min(LADDER_STEP_KINDS.length - 1, Math.max(0, index))];
}
