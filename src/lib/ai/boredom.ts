export type BoredomSignals = {
  accuracyPct: number;
  speedVsBaseline: number; // 1.0 means same as baseline, >1 faster
  scaffoldsUsed: number;
  recentSuccesses: number;
  interactionsInWindow: number;
};

export type EngagementState = "struggling" | "steady" | "advanced" | "bored_candidate";

/**
 * Phase 3 scaffold from architecture rules:
 * - high accuracy
 * - relative efficiency (vs student's own baseline)
 * - consistency window
 * - low scaffolds
 */
export function classifyEngagementState(s: BoredomSignals): EngagementState {
  const highAccuracy = s.accuracyPct >= 85;
  const efficient = s.speedVsBaseline >= 1.15;
  const consistent = s.recentSuccesses >= 3 && s.interactionsInWindow >= 6;
  const lowScaffolds = s.scaffoldsUsed <= 1;

  if (highAccuracy && efficient && consistent && lowScaffolds) return "bored_candidate";
  if (s.accuracyPct >= 80) return "advanced";
  if (s.accuracyPct < 55) return "struggling";
  return "steady";
}
