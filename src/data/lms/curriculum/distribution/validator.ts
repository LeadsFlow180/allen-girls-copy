import type { CurriculumSkill, SubjectCategory } from "../types";
import { LOCKED_DISTRIBUTION_RATIOS } from "./constants";

const ORDER: SubjectCategory[] = [
  "STEM",
  "ELA",
  "SEL",
  "Culture",
  "Life_Skills",
];

function countsFromSkills(skills: CurriculumSkill[]) {
  const counts: Record<SubjectCategory, number> = {
    STEM: 0,
    ELA: 0,
    SEL: 0,
    Culture: 0,
    Life_Skills: 0,
  };
  for (const s of skills) {
    counts[s.subject_category]++;
  }
  return counts;
}

/**
 * Exact ratio (integer counts) — only possible when n is a multiple of 10
 * (e.g. 10 items → 4,2,2,1,1).
 */
export function validateModuleDistributionExact(skills: CurriculumSkill[]): boolean {
  const total = skills.length;
  if (total === 0) return false;
  if (total % 10 !== 0) return false;

  const counts = countsFromSkills(skills);
  const expected = {
    STEM: Math.round(LOCKED_DISTRIBUTION_RATIOS.STEM * total),
    ELA: Math.round(LOCKED_DISTRIBUTION_RATIOS.ELA * total),
    SEL: Math.round(LOCKED_DISTRIBUTION_RATIOS.SEL * total),
    Culture: Math.round(LOCKED_DISTRIBUTION_RATIOS.Culture * total),
    Life_Skills: Math.round(LOCKED_DISTRIBUTION_RATIOS.Life_Skills * total),
  };

  return ORDER.every((k) => counts[k] === expected[k]);
}

/**
 * For any item count: allow small drift from ideal percentages (discrete items can't always be exact).
 */

export function validateModuleDistributionApproximate(
  skills: CurriculumSkill[],
  tolerance = 0.08
): boolean {
  const total = skills.length;
  if (total === 0) return false;

  const counts = countsFromSkills(skills);
  return ORDER.every((k) => {
    const actual = counts[k] / total;
    const target = LOCKED_DISTRIBUTION_RATIOS[k];
    return Math.abs(actual - target) <= tolerance;
  });
}
