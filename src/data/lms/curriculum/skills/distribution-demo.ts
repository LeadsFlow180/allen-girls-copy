import type { CurriculumSkill } from "../types";

/**
 * Exactly 10 placeholder skills with valid 4/2/2/1/1 counts — use to test
 * validateModuleDistributionExact() until real content fills mod_01.
 */
export const mod01DistributionDemoSkills: CurriculumSkill[] = [
  ...([0, 1, 2, 3] as const).map((i) => ({
    id: `skill_mod01_stem_${i}`,
    module_id: "mod_01",
    subject_category: "STEM" as const,
    standard_code: "PLACEHOLDER-STEM",
    description: "Placeholder STEM skill — replace with CCSS/NGSS-backed node.",
    prereq_skill_ids: [] as string[],
    tags: { placeholder: true },
  })),
  ...([0, 1] as const).map((i) => ({
    id: `skill_mod01_ela_${i}`,
    module_id: "mod_01",
    subject_category: "ELA" as const,
    standard_code: "PLACEHOLDER-ELA",
    description: "Placeholder ELA skill — replace with CCSS-backed node.",
    prereq_skill_ids: [] as string[],
    tags: { placeholder: true },
  })),
  ...([0, 1] as const).map((i) => ({
    id: `skill_mod01_sel_${i}`,
    module_id: "mod_01",
    subject_category: "SEL" as const,
    standard_code: "PLACEHOLDER-SEL",
    description: "Placeholder SEL skill — replace with AGA SEL standard.",
    prereq_skill_ids: [] as string[],
    tags: { placeholder: true },
  })),
  {
    id: "skill_mod01_culture_0",
    module_id: "mod_01",
    subject_category: "Culture",
    standard_code: "PLACEHOLDER-CULTURE",
    description: "Placeholder Culture skill — replace with C3/state mapping.",
    prereq_skill_ids: [],
    tags: { placeholder: true },
  },
  {
    id: "skill_mod01_life_0",
    module_id: "mod_01",
    subject_category: "Life_Skills",
    standard_code: "PLACEHOLDER-LIFE",
    description: "Placeholder Life Skills node — replace with AGA standard.",
    prereq_skill_ids: [],
    tags: { placeholder: true },
  },
];
