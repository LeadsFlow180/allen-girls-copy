// ============================================================
// Cadet Rank ladder — the player's long-term progression
// through the AGA universe. Derived purely from earned XP
// (Mission Energy), so it reflects real accomplishment and
// needs no separate storage.
// ============================================================

export type CadetRank = {
  id: string;
  name: string;
  /** XP required to reach this rank. */
  minXp: number;
  emoji: string;
  /** Short flavor shown as a "clearance" line, story-style. */
  clearance: string;
};

export const CADET_RANKS: CadetRank[] = [
  {
    id: "provisional-cadet",
    name: "Provisional Cadet",
    minXp: 0,
    emoji: "🌱",
    clearance: "Basic mission access granted.",
  },
  {
    id: "star-cadet",
    name: "Star Cadet",
    minXp: 250,
    emoji: "⭐",
    clearance: "Nova Star Command recognizes your first missions.",
  },
  {
    id: "explorer",
    name: "Explorer",
    minXp: 750,
    emoji: "🧭",
    clearance: "New S.P.A.R.K. archive permissions available.",
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    minXp: 1500,
    emoji: "🗺️",
    clearance: "Deeper world locations unlocked.",
  },
  {
    id: "senior-explorer",
    name: "Senior Explorer",
    minXp: 3000,
    emoji: "🔭",
    clearance: "Higher-level story mysteries cleared for review.",
  },
  {
    id: "guardian",
    name: "Guardian",
    minXp: 6000,
    emoji: "🛡️",
    clearance: "Full Guardian clearance. The universe trusts you.",
  },
];

export type CadetRankProgress = {
  current: CadetRank;
  next: CadetRank | null;
  index: number;
  total: number;
  xpIntoRank: number;
  xpForNext: number | null;
  percentToNext: number;
};

export function getCadetRank(xp: number): CadetRankProgress {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0));

  let index = 0;
  for (let i = 0; i < CADET_RANKS.length; i += 1) {
    if (safeXp >= CADET_RANKS[i].minXp) index = i;
  }

  const current = CADET_RANKS[index];
  const next = CADET_RANKS[index + 1] ?? null;
  const xpIntoRank = safeXp - current.minXp;
  const xpForNext = next ? next.minXp - current.minXp : null;
  const percentToNext =
    next && xpForNext && xpForNext > 0
      ? Math.min(100, Math.max(0, Math.round((xpIntoRank / xpForNext) * 100)))
      : 100;

  return {
    current,
    next,
    index,
    total: CADET_RANKS.length,
    xpIntoRank,
    xpForNext,
    percentToNext,
  };
}
