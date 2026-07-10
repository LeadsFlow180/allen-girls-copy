/**
 * Mission / curriculum routing — Phase 2.
 * Uses placement outcomes + global curriculum graph (modules/skills).
 * Worlds are presentation-only; this picks entry points per domain and overall.
 */

import type { CurriculumSkill } from "@/data/lms/curriculum/types";
import { getSkillsByModuleId } from "@/data/lms/curriculum/skills/modules";
import { tierFromPercent } from "@/data/lms/placement/scoring";
import type { PlacementScoreResult, PlacementTier } from "@/data/lms/placement/types";

/** Same list as placement debrief — keep in sync by importing here only. */
export const PLACEMENT_WORLD_OPTIONS = [
  { slug: "around-the-way", name: "Around The Way", emoji: "🏘️", tiers: ["emerging"] as PlacementTier[] },
  { slug: "fossil-frontier", name: "Fossil Frontier", emoji: "🦕", tiers: ["emerging", "on_track"] as PlacementTier[] },
  { slug: "kingdom-wild", name: "Kingdom of the Wild", emoji: "🦁", tiers: ["on_track"] as PlacementTier[] },
  { slug: "aqua-azul", name: "The Lost City of Aqua Azul", emoji: "🌊", tiers: ["on_track", "stretch"] as PlacementTier[] },
  { slug: "crystal-tundra", name: "The Crystal Tundra", emoji: "❄️", tiers: ["on_track", "stretch"] as PlacementTier[] },
  { slug: "futuria-world", name: "Futuria World", emoji: "🤖", tiers: ["stretch"] as PlacementTier[] },
  { slug: "great-jade-jungle", name: "The Great Jade Jungle", emoji: "🌴", tiers: ["stretch"] as PlacementTier[] },
] as const;

export function worldsForPlacementTier(tier: PlacementTier) {
  return PLACEMENT_WORLD_OPTIONS.filter((w) => w.tiers.includes(tier));
}

/**
 * Deterministic world pick (matches debrief API: stable per nickname length).
 */
export function pickRecommendedWorld(tier: PlacementTier, displayName: string): (typeof PLACEMENT_WORLD_OPTIONS)[number] {
  const candidates = worldsForPlacementTier(tier);
  const seed = displayName.trim().length;
  return candidates[seed % candidates.length] ?? candidates[0];
}

const TIER_RANK: Record<PlacementTier, number> = {
  emerging: 0,
  on_track: 1,
  stretch: 2,
};

export function domainTiersFromPlacementScore(score: PlacementScoreResult): {
  ela: PlacementTier;
  math: PlacementTier;
} {
  return {
    ela: tierFromPercent(score.elaPercent),
    math: tierFromPercent(score.mathPercent),
  };
}

/**
 * Which domain should get extra attention first (lower tier = needs more support).
 */
export function focusDomainFromTiers(ela: PlacementTier, math: PlacementTier): "ela" | "math" {
  if (TIER_RANK[ela] < TIER_RANK[math]) return "ela";
  if (TIER_RANK[math] < TIER_RANK[ela]) return "math";
  return "ela";
}

function skillSortKey(s: CurriculumSkill): number {
  const g = s.tags?.grade_level;
  if (typeof g === "number") return g;
  return 99;
}

/**
 * Ordered skill IDs to surface next in `activeModuleId` (MVP: mod_01 only).
 * Puts focus-domain category first (ELA vs STEM for math), then other skills.
 */
export function recommendedSkillQueue(
  moduleId: string,
  focusDomain: "ela" | "math",
): string[] {
  const skills = getSkillsByModuleId(moduleId);
  if (skills.length === 0) return [];

  const elaSkills = skills.filter((s) => s.subject_category === "ELA");
  const stemSkills = skills.filter((s) => s.subject_category === "STEM");
  const other = skills.filter((s) => s.subject_category !== "ELA" && s.subject_category !== "STEM");

  const sortByGrade = (list: CurriculumSkill[]) =>
    [...list].sort((a, b) => skillSortKey(a) - skillSortKey(b));

  const primary = focusDomain === "ela" ? sortByGrade(elaSkills) : sortByGrade(stemSkills);
  const secondary = focusDomain === "ela" ? sortByGrade(stemSkills) : sortByGrade(elaSkills);

  return [...primary, ...secondary, ...sortByGrade(other)].map((s) => s.id);
}

export type LearningPathRecommendation = {
  activeModuleId: string;
  overallTier: PlacementTier;
  elaTier: PlacementTier;
  mathTier: PlacementTier;
  focusDomain: "ela" | "math";
  recommendedWorldSlug: string;
  recommendedWorldTitle: string;
  recommendedWorldEmoji: string;
  nextSkillIds: string[];
};

export function buildLearningPathRecommendation(
  score: PlacementScoreResult,
  displayName: string,
  activeModuleId = "mod_01",
): LearningPathRecommendation {
  const { ela, math } = domainTiersFromPlacementScore(score);
  const focusDomain = focusDomainFromTiers(ela, math);
  const world = pickRecommendedWorld(score.tier, displayName);
  const nextSkillIds = recommendedSkillQueue(activeModuleId, focusDomain);

  return {
    activeModuleId,
    overallTier: score.tier,
    elaTier: ela,
    mathTier: math,
    focusDomain,
    recommendedWorldSlug: world.slug,
    recommendedWorldTitle: world.name,
    recommendedWorldEmoji: world.emoji,
    nextSkillIds,
  };
}
