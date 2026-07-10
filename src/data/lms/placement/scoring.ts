import { placementItems } from "./items";
import type { PlacementScoreResult, PlacementTier } from "./types";

/**
 * Tier from overall percent — scales if question count changes.
 * Under 40% emerging, 40–74% on_track, 75%+ stretch.
 */
export function tierFromPercent(overallPercent: number): PlacementTier {
  if (overallPercent < 40) return "emerging";
  if (overallPercent < 75) return "on_track";
  return "stretch";
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/**
 * @param answers — question id → selected choice index (0–3). Missing = wrong.
 */
export function scorePlacement(answers: Record<string, number>): PlacementScoreResult {
  let elaCorrect = 0;
  let elaTotal = 0;
  let mathCorrect = 0;
  let mathTotal = 0;

  for (const q of placementItems) {
    const picked = answers[q.id];
    const ok = picked === q.correctIndex;
    if (q.section === "ela") {
      elaTotal += 1;
      if (ok) elaCorrect += 1;
    } else {
      mathTotal += 1;
      if (ok) mathCorrect += 1;
    }
  }

  const totalCorrect = elaCorrect + mathCorrect;
  const totalQuestions = placementItems.length;
  const overallPercent = pct(totalCorrect, totalQuestions);
  const tier = tierFromPercent(overallPercent);

  return {
    tier,
    elaCorrect,
    elaTotal,
    mathCorrect,
    mathTotal,
    totalCorrect,
    totalQuestions,
    elaPercent: pct(elaCorrect, elaTotal),
    mathPercent: pct(mathCorrect, mathTotal),
    overallPercent,
  };
}
