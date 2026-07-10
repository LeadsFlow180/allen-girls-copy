/**
 * Locked module distribution — every global module must match this mix
 * (story reskin is applied after the full 100% block is assembled).
 *
 * Canonical breakdown (authoritative copy for LMS / UI):
 * - 40% STEM — Science, Math, Engineering, and Technology
 * - 20% ELA (English Language Arts) — Reading, Writing, Comprehension, and Vocabulary
 * - 20% SEL — Emotions, Relationships, Conflict resolution, and Behavioral awareness
 * - 10% Culture — Global awareness, History, and Diversity
 * - 10% Life Skills — Decision-making, Responsibility, and Practical skills
 */

export const LOCKED_DISTRIBUTION_RATIOS = {
  /** 40% — Science, Math, Engineering, Technology */
  STEM: 0.4,
  /** 20% — Reading, Writing, Comprehension, Vocabulary */
  ELA: 0.2,
  /** 20% — Emotions, Relationships, Conflict resolution, Behavioral awareness */
  SEL: 0.2,
  /** 10% — Global awareness3, History, Diversity */
  Culture: 0.1,
  /** 10% — Decision-making, Responsibility, Practical skills */
  Life_Skills: 0.1,
} as const;

export type DistributionKey = keyof typeof LOCKED_DISTRIBUTION_RATIOS;

/**
 * Sub-categories mapped under each top-level bucket (for tagging content, UI labels, and validators).
 */
export const SUBJECT_MAPPINGS = {
  STEM: ["Science", "Math", "Engineering", "Technology"],
  ELA: ["Reading", "Writing", "Comprehension", "Vocabulary"],
  SEL: ["Emotions", "Relationships", "Conflict resolution", "Behavioral awareness"],
  Culture: ["Global awareness", "History", "Diversity"],
  Life_Skills: ["Decision-making", "Responsibility", "Practical skills"],
} as const;

/** Human-readable lines (e.g. tooltips, parent-facing copy). */
export const DISTRIBUTION_BREAKDOWN_LINES = [
  { key: "STEM" as const, percent: 40, label: "STEM", detail: "Science, Math, Engineering, and Technology" },
  { key: "ELA" as const, percent: 20, label: "ELA (English Language Arts)", detail: "Reading, Writing, Comprehension, and Vocabulary" },
  { key: "SEL" as const, percent: 20, label: "Social-Emotional Learning (SEL)", detail: "Emotions, Relationships, Conflict resolution, and Behavioral awareness" },
  { key: "Culture" as const, percent: 10, label: "Culture", detail: "Global awareness, History, and Diversity" },
  { key: "Life_Skills" as const, percent: 10, label: "Life Skills", detail: "Decision-making, Responsibility, and Practical skills" },
] as const;

/** Smallest item count where exact 40/20/20/10/10 integer counts exist (LCM of denominators). */
export const MIN_ITEMS_FOR_EXACT_DISTRIBUTION = 10;
