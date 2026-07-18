/**
 * Content bank registry — pure lookup, no AI (PROGRESSION-SPEC §3).
 *
 * Every skill from the canonical registry (skills-registry.ts / AGA-CUR-001)
 * gets exactly one pool "shelf" here. Empty shelves are fine — they're filled
 * with BankQuestions over time. Games and placement look questions up by the
 * canonical `SK-*` skill ID; the correct answer + hints never leave the server.
 */
import type { Band, BankQuestion, SkillQuestionPool } from "./types";
import { SKILLS_REGISTRY } from "./skills-registry";

// Grade 3 · Math
import { M3_1_POOLS } from "./grade-3/math/m3-1-operations";
import { M3_2_POOLS } from "./grade-3/math/m3-2-place-value";
import { M3_3_POOLS } from "./grade-3/math/m3-3-fractions";
import { M3_4_POOLS } from "./grade-3/math/m3-4-measurement";
import { M3_5_POOLS } from "./grade-3/math/m3-5-geometry";

// Grade 3 · ELA
import { E3_1_POOLS } from "./grade-3/ela/e3-1-reading-lit";
import { E3_2_POOLS } from "./grade-3/ela/e3-2-reading-info";
import { E3_3_POOLS } from "./grade-3/ela/e3-3-writing";
import { E3_4_POOLS } from "./grade-3/ela/e3-4-language";
import { E3_5_POOLS } from "./grade-3/ela/e3-5-speaking";

export const CONTENT_BANK: SkillQuestionPool[] = [
  ...M3_1_POOLS,
  ...M3_2_POOLS,
  ...M3_3_POOLS,
  ...M3_4_POOLS,
  ...M3_5_POOLS,
  ...E3_1_POOLS,
  ...E3_2_POOLS,
  ...E3_3_POOLS,
  ...E3_4_POOLS,
  ...E3_5_POOLS,
];

const byQuestionId = new Map<string, BankQuestion>();
const bySkillId = new Map<string, SkillQuestionPool>();
for (const pool of CONTENT_BANK) {
  bySkillId.set(pool.skillId, pool);
  for (const q of pool.questions) byQuestionId.set(q.id, q);
}

export function getPoolForSkill(skillId: string): SkillQuestionPool | undefined {
  return bySkillId.get(skillId);
}

export function getQuestionsForSkill(skillId: string, band: Band): BankQuestion[] {
  const pool = getPoolForSkill(skillId);
  return pool ? pool.questions.filter((q) => q.band === band) : [];
}

/** Server-side answer lookup (includes correctIndex + hints). */
export function getQuestionById(questionId: string): BankQuestion | undefined {
  return byQuestionId.get(questionId);
}

/**
 * Pick the next question for a student: their band, excluding recently used
 * question IDs when possible so questions don't repeat back-to-back.
 * Returns undefined if that skill's shelf has no questions for the band yet.
 */
export function pickNextQuestion(
  skillId: string,
  band: Band,
  excludeIds: string[] = [],
): BankQuestion | undefined {
  const candidates = getQuestionsForSkill(skillId, band);
  if (candidates.length === 0) return undefined;
  const fresh = candidates.filter((q) => !excludeIds.includes(q.id));
  const from = fresh.length > 0 ? fresh : candidates;
  return from[Math.floor(Math.random() * from.length)];
}

/**
 * Authoring health check (not used at runtime): lists registry skills that have
 * no shelf, and shelves whose skill isn't in the registry. Handy in a test or
 * a quick script while filling in questions.
 */
export function contentBankCoverage(): {
  totalSkills: number;
  shelves: number;
  emptyShelves: string[];
  missingShelves: string[];
  orphanShelves: string[];
} {
  const registryIds = new Set(SKILLS_REGISTRY.map((s) => s.skillId));
  const shelfIds = new Set(CONTENT_BANK.map((p) => p.skillId));
  return {
    totalSkills: registryIds.size,
    shelves: shelfIds.size,
    emptyShelves: CONTENT_BANK.filter((p) => p.questions.length === 0).map((p) => p.skillId),
    missingShelves: [...registryIds].filter((id) => !shelfIds.has(id)),
    orphanShelves: [...shelfIds].filter((id) => !registryIds.has(id)),
  };
}
