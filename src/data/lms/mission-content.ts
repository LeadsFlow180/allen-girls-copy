/**
 * Mission content for mod_01.
 * Each skill step has a base question + optional world-skinned variants.
 * Crisis gates → multiple choice.  Discovery gates → open response.
 */

export type MCOption = { id: "A" | "B" | "C" | "D"; text: string };

export type MissionStep = {
  skillId: string;
  subject: "ELA" | "STEM" | "SEL" | "Culture" | "Life_Skills";
  gateType: "crisis" | "discovery";
  /** Short headline S.P.A.R.K. uses to introduce the step */
  briefingTitle: string;
  /** S.P.A.R.K.'s mission intro text (can include {world} placeholder) */
  sparkIntro: string;
  /** Optional short passage to read before answering */
  passage?: string;
  /** The actual question / prompt */
  question: string;
  /** Multiple choice options (crisis gate only) */
  options?: MCOption[];
  /** Correct option id (crisis gate only) */
  correctOption?: "A" | "B" | "C" | "D";
  /** Keywords for local scoring (discovery gate) */
  expectedKeywords?: string[];
  /** World-slug overrides — replace passage / sparkIntro for specific worlds */
  worldVariants?: Record<string, Partial<Pick<MissionStep, "passage" | "sparkIntro" | "question" | "options" | "correctOption">>>;
};

export const mod01Steps: MissionStep[] = [
  // ── STEP 1 — ELA: Main Idea (discovery gate) ─────────────────────────
  {
    skillId: "skill_ela_5_ri2",
    subject: "ELA",
    gateType: "discovery",
    briefingTitle: "Reading Intel",
    sparkIntro:
      "Recruit, every mission starts with a field report. Read this carefully — then tell me the main idea in your own words.",
    question:
      "In one or two sentences, what is the main idea of the passage you just read?",
    expectedKeywords: ["main idea", "mostly about", "important", "describes", "explains", "tells us", "about"],
    worldVariants: {
      "aqua-azul": {
        passage:
          "The Lost City of Aqua Azul was built beneath the waves thousands of years ago. Its citizens learned to breathe underwater and build homes from living coral. The city's greatest achievement was a tide-powered library that stored knowledge in glowing scrolls. Explorers who visit today say the most important thing to understand is how the Aqua Azulians worked together to survive in an environment no one else could.",
        sparkIntro: "Recruit — S.P.A.R.K. intercepted a scroll from the deep. Read it. Then tell me what the whole passage is REALLY about.",
      },
      "fossil-frontier": {
        passage:
          "Fossil Frontier is a canyon valley where three sisters once discovered the world's most complete T-Rex skeleton. The discovery changed what scientists believed about how dinosaurs lived in groups. Most of the field notes focus on one key idea: dinosaurs were far more social than anyone had imagined. Every dig since then has tried to build on that single discovery.",
        sparkIntro: "Recruit — S.P.A.R.K. found these field notes buried in the canyon wall. Read fast — then summarize what they're mainly about.",
      },
      "crystal-tundra": {
        passage:
          "The Crystal Tundra is a frozen landscape where ancient ice inscriptions tell the history of the people who once lived there. Scientists believe the inscriptions were left as a warning — the land could freeze over completely if the ice crystals were disturbed. The most important message carved into the wall is about balance: everything in the tundra depends on everything else staying in its proper place.",
        sparkIntro: "Recruit — these ice inscriptions were discovered before the blizzard. Read them carefully. Then tell me the main idea before the temperature drops.",
      },
      "around-the-way": {
        passage:
          "Around The Way is a neighborhood where the community bulletin board holds all the important updates. Last week's most important post explained the new community garden rules: everyone plants two rows, everyone waters every morning, and everyone shares the harvest. The main point of the board is simple — a neighborhood works best when everyone does their part.",
        sparkIntro: "Agent — S.P.A.R.K. scanned the community bulletin board. Read what it says. Then tell me the main message.",
      },
      "futuria-world": {
        passage:
          "Futuria World is a city run almost entirely by artificial intelligence. The city's designers had one central idea: technology should serve people, not replace them. Every robot, every hover drone, and every learning core was built to make human life easier — not to do the thinking for humans. The future, they believed, belonged to people who could work alongside machines.",
        sparkIntro: "Recruit — S.P.A.R.K. downloaded the Futuria design report. Read it quickly. Then explain what the whole document is mainly saying.",
      },
      "great-jade-jungle": {
        passage:
          "The Great Jade Jungle is home to the most biodiverse ecosystem on the planet. Explorer journals from the first expedition focus on one central idea: the jungle survives because every plant and animal depends on every other one. The tallest jade trees need the smallest beetles to spread their seeds. Without the beetles, the trees die. Without the trees, the beetles have nowhere to live.",
        sparkIntro: "Recruit — the explorer's map came with these field notes. Read them. Then tell me what the whole passage is mainly trying to say.",
      },
      "kingdom-wild": {
        passage:
          "The Kingdom of the Wild is governed by an Animal Council made up of one representative from every biome. The council's founding charter explains the most important rule: every animal, large or small, has an equal voice. The council was created because the animals discovered that problems affecting one biome — like a drought — eventually affected all of them.",
        sparkIntro: "Recruit — S.P.A.R.K. found the Kingdom's founding charter. Read it. Then tell me the main idea in your own words.",
      },
    },
  },

  // ── STEP 2 — STEM: Multiplication (crisis gate) ──────────────────────
  {
    skillId: "skill_math_3_oa_a1",
    subject: "STEM",
    gateType: "crisis",
    briefingTitle: "Math Systems Check",
    sparkIntro:
      "Recruit — numbers don't lie. S.P.A.R.K. needs a fast calculation. Read the mission data and pick the right answer.",
    question:
      "The mission team has 6 supply crates. Each crate holds 8 energy packs. How many energy packs are there in total?",
    options: [
      { id: "A", text: "14 packs" },
      { id: "B", text: "42 packs" },
      { id: "C", text: "48 packs" },
      { id: "D", text: "56 packs" },
    ],
    correctOption: "C",
    worldVariants: {
      "aqua-azul": {
        sparkIntro: "Recruit — the coral gate has 7 locks on each of its 9 sections. S.P.A.R.K. needs the total fast — the tide is rising!",
        question: "The coral gate has 7 locks on each section. There are 9 sections. How many locks are there in total?",
        options: [
          { id: "A", text: "16 locks" },
          { id: "B", text: "54 locks" },
          { id: "C", text: "63 locks" },
          { id: "D", text: "72 locks" },
        ],
        correctOption: "C",
      },
      "fossil-frontier": {
        sparkIntro: "Recruit — the canyon has 8 dig sites. Each site needs 6 labeled sample bags. How many bags does the whole expedition need?",
        question: "There are 8 dig sites. Each site requires 6 sample bags. How many bags are needed in total?",
        options: [
          { id: "A", text: "14 bags" },
          { id: "B", text: "40 bags" },
          { id: "C", text: "48 bags" },
          { id: "D", text: "54 bags" },
        ],
        correctOption: "C",
      },
      "crystal-tundra": {
        sparkIntro: "Recruit — 9 igloo teams each need 7 supply sleds delivered before the blizzard. Quick — what's the total?",
        question: "There are 9 igloo teams. Each team needs 7 supply sleds. How many sleds are needed in total?",
        options: [
          { id: "A", text: "16 sleds" },
          { id: "B", text: "56 sleds" },
          { id: "C", text: "63 sleds" },
          { id: "D", text: "72 sleds" },
        ],
        correctOption: "C",
      },
    },
  },

  // ── STEP 3 — SEL: Growth Mindset (discovery gate) ────────────────────
  {
    skillId: "skill_sel_aga_overcoming",
    subject: "SEL",
    gateType: "discovery",
    briefingTitle: "Mental Strength Check",
    sparkIntro:
      "Recruit — the toughest missions need more than math skills. S.P.A.R.K. needs to know: how do you handle a challenge that feels impossible?",
    question:
      "Think about a time when something was really hard or you made a mistake. What did you do to keep going? What helped you not give up?",
    expectedKeywords: [
      "tried", "kept going", "again", "didn't give up", "practice", "help",
      "breathe", "step", "patience", "mistake", "learned", "better", "push",
    ],
  },

  // ── STEP 4 — Culture: Community Rules (discovery gate) ───────────────
  {
    skillId: "skill_culture_aga_community",
    subject: "Culture",
    gateType: "discovery",
    briefingTitle: "Community Intel",
    sparkIntro:
      "Every world runs on rules, Recruit. S.P.A.R.K. needs to know if you understand why communities need them — and what makes them fair.",
    question:
      "Name two rules that help people in a community get along with each other. Explain why each rule is important.",
    expectedKeywords: [
      "rule", "rules", "community", "help", "together", "fair", "safe", "respect",
      "share", "listen", "agree", "everyone", "treat", "others",
    ],
    worldVariants: {
      "kingdom-wild": {
        sparkIntro: "The Animal Council made rules so every animal — big or small — has a voice. S.P.A.R.K. wants to know: why do communities need rules at all?",
        question: "The Animal Council gave every biome an equal vote. Why do you think they made that rule? What would happen without it?",
      },
      "around-the-way": {
        sparkIntro: "The neighborhood board has a list of community rules. S.P.A.R.K. wants to know: why do neighborhoods need rules? Pick two and explain them.",
        question: "Think about your own neighborhood or school. Name two rules that help people get along. Explain why each one matters.",
      },
    },
  },

  // ── STEP 5 — Life Skills: Collaboration (discovery gate) ─────────────
  {
    skillId: "skill_life_aga_collaboration",
    subject: "Life_Skills",
    gateType: "discovery",
    briefingTitle: "Team Systems Check",
    sparkIntro:
      "Last scan, Recruit. Every mission needs a team. S.P.A.R.K. needs to know you can work with others — not just alone.",
    question:
      "Imagine your team is stuck on a hard challenge and someone on your team feels like giving up. What do you do? How do you help the team finish together?",
    expectedKeywords: [
      "help", "team", "together", "listen", "encourage", "cheer", "step",
      "share", "idea", "support", "keep going", "remind", "turn", "work",
    ],
  },
];

export function getStepsForModule(moduleId: string): MissionStep[] {
  if (moduleId === "1" || moduleId === "mod_01") return mod01Steps;
  return [];
}

/** Returns the step for a specific skill within a module. */
export function getStepBySkillId(moduleId: string, skillId: string): MissionStep | undefined {
  return getStepsForModule(moduleId).find((s) => s.skillId === skillId);
}

/** Apply world-specific overrides to a step (non-mutating). */
export function applyWorldSkin(step: MissionStep, worldSlug: string): MissionStep {
  const variant = step.worldVariants?.[worldSlug];
  if (!variant) return step;
  return { ...step, ...variant };
}

export const SUBJECT_META: Record<MissionStep["subject"], { emoji: string; label: string; color: string; bg: string }> = {
  ELA:         { emoji: "📖", label: "Reading",      color: "#1d4ed8", bg: "#dbeafe" },
  STEM:        { emoji: "🔢", label: "Math",          color: "#15803d", bg: "#dcfce7" },
  SEL:         { emoji: "💜", label: "Growth",        color: "#be185d", bg: "#fce7f3" },
  Culture:     { emoji: "🌍", label: "Culture",       color: "#854d0e", bg: "#fef9c3" },
  Life_Skills: { emoji: "🤝", label: "Life Skills",   color: "#6b21a8", bg: "#ede9fe" },
};
