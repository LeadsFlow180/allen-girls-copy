import type { CurriculumModule, CurriculumSkill } from "../types";

/** Global module registry — linear sequence (mod_01 → …). */
export const curriculumModules: CurriculumModule[] = [
  {
    id: "mod_01",
    sequence_order: 1,
    title: "Foundations of Comprehension and Operations",
  },
];

/**
 * Module 1 skill nodes — seed data; expand and align descriptions with Vector DB chunks.
 * For a full module block, assemble enough skills so counts match 40/20/20/10/10
 * (e.g. 10 skills → 4 STEM, 2 ELA, 2 SEL, 1 Culture, 1 Life_Skills). The list below
 * is illustrative until the full graph is authored.
 */
export const mod01Skills: CurriculumSkill[] = [
  {
    id: "skill_ela_5_ri2",
    module_id: "mod_01",
    subject_category: "ELA",
    standard_code: "RI.5.2",
    description:
      "Determine two or more main ideas of a text and explain how they are supported by key details; summarize the text.",
    prereq_skill_ids: ["skill_ela_4_ri2"],
    tags: {
      grade_level: 5,
      cognitive_load: "high",
      gate_type: "discovery_gate",
      ai_bounded_rag_domain: "reading_comprehension",
    },
  },
  {
    id: "skill_math_3_oa_a1",
    module_id: "mod_01",
    subject_category: "STEM",
    standard_code: "3.OA.A.1",
    description:
      "Interpret products of whole numbers in context (multiplication as equal groups / arrays).",
    prereq_skill_ids: [],
    tags: {
      grade_level: 3,
      cognitive_load: "medium",
      gate_type: "crisis_gate",
      ai_bounded_rag_domain: "operations_multiplication",
    },
  },
  {
    id: "skill_sel_aga_overcoming",
    module_id: "mod_01",
    subject_category: "SEL",
    standard_code: "AGA-SEL-001",
    description:
      "Persist through difficulty with a growth mindset when facing challenging learning tasks.",
    prereq_skill_ids: [],
    tags: {
      grade_band: "3-5",
      cognitive_load: "medium",
      gate_type: "discovery_gate",
      ai_bounded_rag_domain: "sel_overcoming_challenges",
    },
  },
  {
    id: "skill_culture_aga_community",
    module_id: "mod_01",
    subject_category: "Culture",
    standard_code: "C3-D2.1",
    description:
      "Explain how communities and groups shape rules and norms for civic life.",
    prereq_skill_ids: [],
    tags: {
      grade_band: "3-5",
      cognitive_load: "low",
      cognitive_load_note: "C3 example — replace with your state’s adopted mapping",
      gate_type: "discovery_gate",
    },
  },
  {
    id: "skill_life_aga_collaboration",
    module_id: "mod_01",
    subject_category: "Life_Skills",
    standard_code: "AGA-LS-001",
    description:
      "Collaborate respectfully and follow agreed-upon group norms to complete a shared task.",
    prereq_skill_ids: [],
    tags: {
      grade_band: "3-5",
      cognitive_load: "low",
      gate_type: "discovery_gate",
    },
  },
];

export function getSkillsByModuleId(moduleId: string): CurriculumSkill[] {
  if (moduleId === "mod_01") return mod01Skills;
  return [];
}
