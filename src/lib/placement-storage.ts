import type { PlacementScoreResult } from "@/data/lms/placement/types";
import { markCadetAssessmentComplete } from "@/lib/onboarding/cadet-progress";

const STORAGE_KEY = "aga_placement_result_v1";

export type StoredPlacementResult = {
  version: 1;
  completedAt: string;
  displayName: string;
  score: PlacementScoreResult;
};

export function savePlacementResult(displayName: string, score: PlacementScoreResult): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredPlacementResult = {
      version: 1,
      completedAt: new Date().toISOString(),
      displayName: displayName.trim().slice(0, 48),
      score,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Checkmark: Signal Clarity Scan completed (pairs with intro-video checkmark).
    markCadetAssessmentComplete();
  } catch {
    // ignore quota / private mode
  }
}

export function loadPlacementResult(): StoredPlacementResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPlacementResult;
    if (parsed?.version !== 1 || !parsed.score?.tier) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPlacementResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* empty */
  }
}
