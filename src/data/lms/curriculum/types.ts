/**
 * Global curriculum types — single skill graph, decoupled from Adventure Worlds.
 * Aligns with Postgres curriculum_skills / items tables (see LMS architecture guide).
 */

export type SubjectCategory =
  | "STEM"
  | "ELA"
  | "SEL"
  | "Culture"
  | "Life_Skills";

export interface CurriculumModule {
  /** e.g. "mod_01" */
  id: string;
  sequence_order: number;
  /** e.g. "Foundations of Comprehension and Operations" */
  title: string;
}

export interface CurriculumSkill {
  /** e.g. "skill_math_3_oa_a1" */
  id: string;
  /** Foreign key to CurriculumModule */
  module_id: string;
  subject_category: SubjectCategory;
  /** e.g. "3.OA.A.1", "RI.5.2", "5-LS2-1" */
  standard_code: string;
  /** Abstract learning goal — should match Vector DB chunk text for Bounded RAG */
  description: string;
  /** Prereqs for BKT / ordering */
  prereq_skill_ids: string[];
  /** Flexible metadata: grade_band, cognitive_load, gate_type, etc. */
  tags: Record<string, unknown>;
}

/**
 * One assessable task linked to one or more skills (DB `items` table shape).
 * `primary_subject_category` is required for distribution checks when counting items;
 * multi-skill items should use the skill that “owns” pacing for this item.
 */
export interface AssessmentItem {
  id: string;
  skill_ids: string[];
  /** Base question before world reskin / AI wrapping */
  prompt_template: string;
  answer_key: Record<string, unknown>;
  /** 0.0–1.0 */
  difficulty: number;
  primary_subject_category: SubjectCategory;
}
