/**
 * Placement assessment — types only (items live in items.ts).
 */

export type PlacementSectionId = "ela" | "math";

export interface PlacementQuestion {
  id: string;
  section: PlacementSectionId;
  /** Optional reading passage shown above the prompt (Story Intel clusters). */
  passageTitle?: string;
  passage?: string;
  /** Question text */
  prompt: string;
  choices: [string, string, string, string];
  /** Index 0–3 into choices */
  correctIndex: 0 | 1 | 2 | 3;
}

export type PlacementTier = "emerging" | "on_track" | "stretch";

export interface PlacementScoreResult {
  tier: PlacementTier;
  elaCorrect: number;
  elaTotal: number;
  mathCorrect: number;
  mathTotal: number;
  totalCorrect: number;
  totalQuestions: number;
  elaPercent: number;
  mathPercent: number;
  overallPercent: number;
}
