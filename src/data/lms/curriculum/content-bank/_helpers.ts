/**
 * Scaffolding helper for content-bank pool files.
 *
 * `emptyPool("SK-M3-201")` builds a ready-to-fill pool whose grade/subject/
 * title/standard are pulled straight from the canonical registry, so an empty
 * shelf can never drift from AGA-CUR-001. Just push BankQuestions into
 * `.questions` (or replace the array) when authoring.
 */
import type { SkillQuestionPool } from "./types";
import { getSkill } from "./skills-registry";

export function emptyPool(skillId: string): SkillQuestionPool {
  const s = getSkill(skillId);
  if (!s) {
    throw new Error(
      `content-bank: "${skillId}" is not in skills-registry.ts (must match AGA-CUR-001).`,
    );
  }
  return {
    skillId: s.skillId,
    grade: s.grade,
    subject: s.subject,
    standard: s.moduleId,
    title: s.title,
    questions: [],
  };
}
