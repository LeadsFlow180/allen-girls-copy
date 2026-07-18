/**
 * Canonical skill registry — the single source of truth for skill IDs.
 *
 * Every ID here is copied verbatim from the Master Curriculum Registry
 * (AGA-CUR-001 §2, Grade 3). Per that document's conflict rule:
 *   "If any database, game logic, or external AI script conflicts with this
 *    document, this file's lesson structures and skill IDs win."
 *
 * So: content-bank pools, game catalog `skillIds`, and placement all reference
 * these `SK-*` IDs — never ad-hoc IDs. When we add Grades 4–6, append their
 * rows here using the same shape (nothing else needs to change).
 *
 * `placementStrand` maps a skill to one of the five Signal Clarity Scan strands
 * (see PLACEMENT-SPEC §3). Writing (E*.3) and Speaking (E*.5) have no strand —
 * placement doesn't sample them; gameplay + AI-graded open responses do.
 */

export type SubjectCode = "math" | "ela";

export type PlacementStrand =
  | "MATH-CALC"
  | "MATH-FRAC"
  | "MATH-GEO"
  | "ELA-LANG"
  | "ELA-READ";

export type SkillEntry = {
  /** Canonical skill ID, e.g. "SK-M3-101" */
  skillId: string;
  grade: number;
  subject: SubjectCode;
  /** Module code from the registry, e.g. "M3.1" */
  moduleId: string;
  moduleTitle: string;
  /** Gateway code from the registry, e.g. "GW-M3-OPS" */
  gateway: string;
  /** Human title, e.g. "Build Equal Groups" */
  title: string;
  /** Which placement scan strand samples this skill (undefined = not sampled) */
  placementStrand?: PlacementStrand;
};

export const SKILLS_REGISTRY: SkillEntry[] = [
  // ── Grade 3 · Math ──────────────────────────────────────────────────────
  // M3.1 Operations, Multiplication, Division, and Patterns (GW-M3-OPS)
  { skillId: "SK-M3-101", grade: 3, subject: "math", moduleId: "M3.1", moduleTitle: "Operations, Multiplication, Division, and Patterns", gateway: "GW-M3-OPS", title: "Build Equal Groups", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-102", grade: 3, subject: "math", moduleId: "M3.1", moduleTitle: "Operations, Multiplication, Division, and Patterns", gateway: "GW-M3-OPS", title: "Read and Draw Arrays", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-103", grade: 3, subject: "math", moduleId: "M3.1", moduleTitle: "Operations, Multiplication, Division, and Patterns", gateway: "GW-M3-OPS", title: "Connect Multiplication and Division", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-104", grade: 3, subject: "math", moduleId: "M3.1", moduleTitle: "Operations, Multiplication, Division, and Patterns", gateway: "GW-M3-OPS", title: "Solve Multiplication and Division Stories", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-105", grade: 3, subject: "math", moduleId: "M3.1", moduleTitle: "Operations, Multiplication, Division, and Patterns", gateway: "GW-M3-OPS", title: "Use Patterns and Properties", placementStrand: "MATH-CALC" },

  // M3.2 Place Value, Rounding, Addition, and Subtraction (GW-M3-NBT)
  { skillId: "SK-M3-201", grade: 3, subject: "math", moduleId: "M3.2", moduleTitle: "Place Value, Rounding, Addition, and Subtraction", gateway: "GW-M3-NBT", title: "Hundreds, Tens, and Ones", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-202", grade: 3, subject: "math", moduleId: "M3.2", moduleTitle: "Place Value, Rounding, Addition, and Subtraction", gateway: "GW-M3-NBT", title: "Compare and Order Numbers", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-203", grade: 3, subject: "math", moduleId: "M3.2", moduleTitle: "Place Value, Rounding, Addition, and Subtraction", gateway: "GW-M3-NBT", title: "Round to the Nearest 10 and 100", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-204", grade: 3, subject: "math", moduleId: "M3.2", moduleTitle: "Place Value, Rounding, Addition, and Subtraction", gateway: "GW-M3-NBT", title: "Add Within 1,000", placementStrand: "MATH-CALC" },
  { skillId: "SK-M3-205", grade: 3, subject: "math", moduleId: "M3.2", moduleTitle: "Place Value, Rounding, Addition, and Subtraction", gateway: "GW-M3-NBT", title: "Subtract Within 1,000", placementStrand: "MATH-CALC" },

  // M3.3 Fractions (GW-M3-FR)
  { skillId: "SK-M3-301", grade: 3, subject: "math", moduleId: "M3.3", moduleTitle: "Fractions", gateway: "GW-M3-FR", title: "Understand Fractions as Equal Parts", placementStrand: "MATH-FRAC" },
  { skillId: "SK-M3-302", grade: 3, subject: "math", moduleId: "M3.3", moduleTitle: "Fractions", gateway: "GW-M3-FR", title: "Represent Fractions on Number Lines", placementStrand: "MATH-FRAC" },
  { skillId: "SK-M3-303", grade: 3, subject: "math", moduleId: "M3.3", moduleTitle: "Fractions", gateway: "GW-M3-FR", title: "Compare Fractions with Same Denominator or Numerator", placementStrand: "MATH-FRAC" },
  { skillId: "SK-M3-304", grade: 3, subject: "math", moduleId: "M3.3", moduleTitle: "Fractions", gateway: "GW-M3-FR", title: "Equivalent Fraction Beginnings", placementStrand: "MATH-FRAC" },
  { skillId: "SK-M3-305", grade: 3, subject: "math", moduleId: "M3.3", moduleTitle: "Fractions", gateway: "GW-M3-FR", title: "Solve Fraction Problems in Context", placementStrand: "MATH-FRAC" },

  // M3.4 Measurement and Data (GW-M3-MD)
  { skillId: "SK-M3-401", grade: 3, subject: "math", moduleId: "M3.4", moduleTitle: "Measurement and Data", gateway: "GW-M3-MD", title: "Measure Length with Standard Units", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-402", grade: 3, subject: "math", moduleId: "M3.4", moduleTitle: "Measurement and Data", gateway: "GW-M3-MD", title: "Solve Measurement Word Problems", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-403", grade: 3, subject: "math", moduleId: "M3.4", moduleTitle: "Measurement and Data", gateway: "GW-M3-MD", title: "Time and Money", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-404", grade: 3, subject: "math", moduleId: "M3.4", moduleTitle: "Measurement and Data", gateway: "GW-M3-MD", title: "Represent and Interpret Data", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-405", grade: 3, subject: "math", moduleId: "M3.4", moduleTitle: "Measurement and Data", gateway: "GW-M3-MD", title: "Area Foundations and Perimeter Beginnings", placementStrand: "MATH-GEO" },

  // M3.5 Geometry (GW-M3-GEO)
  { skillId: "SK-M3-501", grade: 3, subject: "math", moduleId: "M3.5", moduleTitle: "Geometry", gateway: "GW-M3-GEO", title: "Recognize Shapes in Different Categories", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-502", grade: 3, subject: "math", moduleId: "M3.5", moduleTitle: "Geometry", gateway: "GW-M3-GEO", title: "Partition Shapes into Equal Shares", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-503", grade: 3, subject: "math", moduleId: "M3.5", moduleTitle: "Geometry", gateway: "GW-M3-GEO", title: "Compare Shape Attributes", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-504", grade: 3, subject: "math", moduleId: "M3.5", moduleTitle: "Geometry", gateway: "GW-M3-GEO", title: "Build and Draw Shapes from Descriptions", placementStrand: "MATH-GEO" },
  { skillId: "SK-M3-505", grade: 3, subject: "math", moduleId: "M3.5", moduleTitle: "Geometry", gateway: "GW-M3-GEO", title: "Use Geometry in Context", placementStrand: "MATH-GEO" },

  // ── Grade 3 · ELA ───────────────────────────────────────────────────────
  // E3.1 Reading Literature (GW-E3-RL)
  { skillId: "SK-E3-101", grade: 3, subject: "ela", moduleId: "E3.1", moduleTitle: "Reading Literature", gateway: "GW-E3-RL", title: "Ask and Answer Questions About Stories", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-102", grade: 3, subject: "ela", moduleId: "E3.1", moduleTitle: "Reading Literature", gateway: "GW-E3-RL", title: "Recount Stories and Determine Central Message", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-103", grade: 3, subject: "ela", moduleId: "E3.1", moduleTitle: "Reading Literature", gateway: "GW-E3-RL", title: "Describe Characters and Their Actions", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-104", grade: 3, subject: "ela", moduleId: "E3.1", moduleTitle: "Reading Literature", gateway: "GW-E3-RL", title: "Explain How Events Build on One Another", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-105", grade: 3, subject: "ela", moduleId: "E3.1", moduleTitle: "Reading Literature", gateway: "GW-E3-RL", title: "Distinguish Literal and Nonliteral Language", placementStrand: "ELA-READ" },

  // E3.2 Reading Informational Text (GW-E3-RI)
  { skillId: "SK-E3-201", grade: 3, subject: "ela", moduleId: "E3.2", moduleTitle: "Reading Informational Text", gateway: "GW-E3-RI", title: "Ask and Answer Questions About Informational Text", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-202", grade: 3, subject: "ela", moduleId: "E3.2", moduleTitle: "Reading Informational Text", gateway: "GW-E3-RI", title: "Determine Main Idea and Key Details", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-203", grade: 3, subject: "ela", moduleId: "E3.2", moduleTitle: "Reading Informational Text", gateway: "GW-E3-RI", title: "Describe Relationships in a Text", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-204", grade: 3, subject: "ela", moduleId: "E3.2", moduleTitle: "Reading Informational Text", gateway: "GW-E3-RI", title: "Use Text Features and Visual Information", placementStrand: "ELA-READ" },
  { skillId: "SK-E3-205", grade: 3, subject: "ela", moduleId: "E3.2", moduleTitle: "Reading Informational Text", gateway: "GW-E3-RI", title: "Compare and Contrast Two Texts on the Same Topic", placementStrand: "ELA-READ" },

  // E3.3 Writing (GW-E3-W) — open response; graded later by AI evidence path, no placement strand
  { skillId: "SK-E3-301", grade: 3, subject: "ela", moduleId: "E3.3", moduleTitle: "Writing", gateway: "GW-E3-W", title: "Write Opinion Pieces" },
  { skillId: "SK-E3-302", grade: 3, subject: "ela", moduleId: "E3.3", moduleTitle: "Writing", gateway: "GW-E3-W", title: "Write Informative/Explanatory Pieces" },
  { skillId: "SK-E3-303", grade: 3, subject: "ela", moduleId: "E3.3", moduleTitle: "Writing", gateway: "GW-E3-W", title: "Write Narratives with Sequence and Detail" },
  { skillId: "SK-E3-304", grade: 3, subject: "ela", moduleId: "E3.3", moduleTitle: "Writing", gateway: "GW-E3-W", title: "Strengthen Writing Through Revision and Support" },
  { skillId: "SK-E3-305", grade: 3, subject: "ela", moduleId: "E3.3", moduleTitle: "Writing", gateway: "GW-E3-W", title: "Use Sources and Digital Tools to Publish" },

  // E3.4 Language and Conventions (GW-E3-L)
  { skillId: "SK-E3-401", grade: 3, subject: "ela", moduleId: "E3.4", moduleTitle: "Language and Conventions", gateway: "GW-E3-L", title: "Grammar and Usage Basics", placementStrand: "ELA-LANG" },
  { skillId: "SK-E3-402", grade: 3, subject: "ela", moduleId: "E3.4", moduleTitle: "Language and Conventions", gateway: "GW-E3-L", title: "Capitalization, Punctuation, and Spelling", placementStrand: "ELA-LANG" },
  { skillId: "SK-E3-403", grade: 3, subject: "ela", moduleId: "E3.4", moduleTitle: "Language and Conventions", gateway: "GW-E3-L", title: "Choose Words and Sentences for Effect", placementStrand: "ELA-LANG" },
  { skillId: "SK-E3-404", grade: 3, subject: "ela", moduleId: "E3.4", moduleTitle: "Language and Conventions", gateway: "GW-E3-L", title: "Use Context and Word Parts to Figure Out Meaning", placementStrand: "ELA-LANG" },
  { skillId: "SK-E3-405", grade: 3, subject: "ela", moduleId: "E3.4", moduleTitle: "Language and Conventions", gateway: "GW-E3-L", title: "Vocabulary, Shades of Meaning, and Figurative Language", placementStrand: "ELA-LANG" },

  // E3.5 Speaking and Listening (GW-E3-SL) — open response; no placement strand
  { skillId: "SK-E3-501", grade: 3, subject: "ela", moduleId: "E3.5", moduleTitle: "Speaking and Listening / Integrated Language Application", gateway: "GW-E3-SL", title: "Engage in Collaborative Discussions" },
  { skillId: "SK-E3-502", grade: 3, subject: "ela", moduleId: "E3.5", moduleTitle: "Speaking and Listening / Integrated Language Application", gateway: "GW-E3-SL", title: "Recount and Explain Information Orally" },
  { skillId: "SK-E3-503", grade: 3, subject: "ela", moduleId: "E3.5", moduleTitle: "Speaking and Listening / Integrated Language Application", gateway: "GW-E3-SL", title: "Ask and Answer Questions About a Speaker or Presentation" },
  { skillId: "SK-E3-504", grade: 3, subject: "ela", moduleId: "E3.5", moduleTitle: "Speaking and Listening / Integrated Language Application", gateway: "GW-E3-SL", title: "Speak Clearly and Present Ideas" },
  { skillId: "SK-E3-505", grade: 3, subject: "ela", moduleId: "E3.5", moduleTitle: "Speaking and Listening / Integrated Language Application", gateway: "GW-E3-SL", title: "Integrate Speaking, Listening, and Language in Context" },
];

const bySkillId = new Map<string, SkillEntry>();
for (const s of SKILLS_REGISTRY) bySkillId.set(s.skillId, s);

export function getSkill(skillId: string): SkillEntry | undefined {
  return bySkillId.get(skillId);
}

export function skillsForGrade(grade: number, subject?: SubjectCode): SkillEntry[] {
  return SKILLS_REGISTRY.filter(
    (s) => s.grade === grade && (subject ? s.subject === subject : true),
  );
}

export function skillsForModule(moduleId: string): SkillEntry[] {
  return SKILLS_REGISTRY.filter((s) => s.moduleId === moduleId);
}

export function skillsForStrand(strand: PlacementStrand, grade: number): SkillEntry[] {
  return SKILLS_REGISTRY.filter((s) => s.grade === grade && s.placementStrand === strand);
}
