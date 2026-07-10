/** Slide kinds shown in unit curriculum preview (maps to classroom scenes later). */
export type CurriculumSlideKind =
  | "story"
  | "vocab"
  | "listen"
  | "speak"
  | "practice"
  | "quiz"
  | "reward";

export type CurriculumSlidePreview = {
  id: string;
  order: number;
  kind: CurriculumSlideKind;
  title: string;
  summary: string;
  /** Sample line learners will hear or read on this slide. */
  sampleLine?: string;
  durationMin: number;
};

export type CurriculumMissionPreview = {
  id: string;
  stepIndex: number;
  title: string;
  subtitle: string;
  accent: string;
  objective: string;
  slides: CurriculumSlidePreview[];
};

export type UnitCurriculumPreview = {
  sectionId: number;
  unitIndex: number;
  unitTitle: string;
  themeColor: string;
  headline: string;
  description: string;
  levelLabel: string;
  estimatedMinutes: number;
  vocabulary: string[];
  missions: CurriculumMissionPreview[];
};

const MISSION_META = [
  { title: "Start", subtitle: "Warm-up story", accent: "#1cb0f6" },
  { title: "Learn", subtitle: "Core lesson", accent: "#58cc02" },
  { title: "Reward", subtitle: "Treasure chest", accent: "#ff9600" },
  { title: "Practice", subtitle: "Quick review", accent: "#7c22c5" },
  { title: "Boss", subtitle: "Unit check", accent: "#e8357a" },
] as const;

const SLIDE_TEMPLATES: Record<
  number,
  Omit<CurriculumSlidePreview, "id" | "order">[]
> = {
  0: [
    {
      kind: "story",
      title: "Meet the crew",
      summary: "Animated intro with Sara and friends at the market.",
      sampleLine: "¡Hola! ¿Cómo estás?",
      durationMin: 2,
    },
    {
      kind: "listen",
      title: "Hear the greeting",
      summary: "Tap to hear native audio and match the phrase.",
      sampleLine: "Buenos días",
      durationMin: 1,
    },
    {
      kind: "vocab",
      title: "Picture cards",
      summary: "Swipe through illustrated greeting cards.",
      durationMin: 2,
    },
    {
      kind: "practice",
      title: "First taps",
      summary: "Choose the correct greeting for each scene.",
      durationMin: 2,
    },
  ],
  1: [
    {
      kind: "vocab",
      title: "Phrase bank",
      summary: "Core hello and goodbye phrases with visuals.",
      sampleLine: "Hasta luego",
      durationMin: 3,
    },
    {
      kind: "listen",
      title: "Audio drills",
      summary: "Repeat-after-me with slowed pronunciation.",
      durationMin: 2,
    },
    {
      kind: "speak",
      title: "Say it aloud",
      summary: "Optional mic practice with gentle feedback.",
      durationMin: 2,
    },
    {
      kind: "practice",
      title: "Mix & match",
      summary: "Pair Spanish phrases to English meanings.",
      durationMin: 3,
    },
  ],
  2: [
    {
      kind: "story",
      title: "Chest unlock",
      summary: "Short celebration scene before opening rewards.",
      durationMin: 1,
    },
    {
      kind: "reward",
      title: "Collect XP & gems",
      summary: "Claim unit streak bonus and sticker pack.",
      durationMin: 1,
    },
  ],
  3: [
    {
      kind: "practice",
      title: "Speed round",
      summary: "Five rapid-fire recall questions.",
      durationMin: 3,
    },
    {
      kind: "listen",
      title: "Spot the phrase",
      summary: "Identify what you hear in everyday contexts.",
      durationMin: 2,
    },
    {
      kind: "speak",
      title: "Mini dialogue",
      summary: "Role-play a two-line exchange with Maya.",
      sampleLine: "Mucho gusto",
      durationMin: 2,
    },
  ],
  4: [
    {
      kind: "quiz",
      title: "Boss review",
      summary: "Mixed questions from all prior missions.",
      durationMin: 4,
    },
    {
      kind: "quiz",
      title: "Confidence check",
      summary: "Prove mastery to unlock the next unit.",
      durationMin: 3,
    },
  ],
};

const UNIT_TOPICS = [
  "first greetings and polite hellos",
  "introducing yourself to new friends",
  "classroom phrases and school routines",
  "family members and home vocabulary",
  "ordering food and café conversations",
  "numbers, dates, and telling time",
  "feelings and how you are doing",
  "places around town and directions",
  "hobbies and free-time activities",
  "section review and celebration quiz",
];

const VOCAB_BANKS: string[][] = [
  ["hola", "adiós", "buenos días", "buenas tardes", "por favor"],
  ["me llamo", "mucho gusto", "¿cómo te llamas?", "encantado/a"],
  ["la clase", "el profesor", "estudiar", "la tarea"],
  ["mamá", "papá", "hermano", "hermana", "casa"],
  ["comer", "beber", "la mesa", "la cuenta", "gracias"],
  ["uno", "dos", "tres", "la hora", "hoy"],
  ["feliz", "triste", "cansado/a", "bien", "mal"],
  ["la plaza", "el parque", "cerca", "lejos"],
  ["jugar", "leer", "dibujar", "el deporte"],
  ["repasar", "practicar", "¡excelente!", "siguiente unidad"],
];

function stripUnitPrefix(title: string): string {
  const m = title.match(/^Unit\s+\d+\s*[·•]\s*(.+)$/i);
  return m?.[1]?.trim() ?? title;
}

/** Placeholder curriculum until Supabase unit/slide content is wired. */
export function getUnitCurriculumPreview(input: {
  sectionId: number;
  unitIndex: number;
  unitTitle: string;
  themeColor: string;
}): UnitCurriculumPreview {
  const { sectionId, unitIndex, unitTitle, themeColor } = input;
  const topic = UNIT_TOPICS[unitIndex % UNIT_TOPICS.length] ?? UNIT_TOPICS[0];
  const topicLabel = stripUnitPrefix(unitTitle);
  const vocab = VOCAB_BANKS[unitIndex % VOCAB_BANKS.length] ?? VOCAB_BANKS[0];

  const missions: CurriculumMissionPreview[] = MISSION_META.map((meta, stepIndex) => {
    const templates = SLIDE_TEMPLATES[stepIndex] ?? SLIDE_TEMPLATES[0];
    const slides: CurriculumSlidePreview[] = templates.map((t, i) => ({
      ...t,
      id: `s${sectionId}-u${unitIndex}-m${stepIndex}-slide${i}`,
      order: i + 1,
      title:
        stepIndex === 0 && i === 0
          ? `${topicLabel}: ${t.title}`
          : t.title,
    }));

    const objectives = [
      `Set context for ${topic} with a short story.`,
      `Learn and recognize key phrases for ${topic}.`,
      `Celebrate progress and collect unit rewards.`,
      `Strengthen recall with mixed ${topic} practice.`,
      `Demonstrate mastery before advancing to the next unit.`,
    ];

    return {
      id: `s${sectionId}-u${unitIndex}-m${stepIndex}`,
      stepIndex,
      title: meta.title,
      subtitle: meta.subtitle,
      accent: meta.accent,
      objective: objectives[stepIndex] ?? objectives[0],
      slides,
    };
  });

  const slideCount = missions.reduce((n, m) => n + m.slides.length, 0);
  const estimatedMinutes = missions.reduce(
    (n, m) => n + m.slides.reduce((s, sl) => s + sl.durationMin, 0),
    0,
  );

  return {
    sectionId,
    unitIndex,
    unitTitle,
    themeColor,
    headline: topicLabel,
    description: `This unit focuses on ${topic}. Learners move through five classroom missions—each mission is one ladder step on the path—with slides for stories, vocabulary, listening, practice, and a final boss check.`,
    levelLabel: unitIndex < 3 ? "Foundations" : unitIndex < 7 ? "Building" : "Mastery",
    estimatedMinutes,
    vocabulary: vocab,
    missions,
  };
}

export function getCurriculumPreviewStats(preview: UnitCurriculumPreview) {
  const slideCount = preview.missions.reduce((n, m) => n + m.slides.length, 0);
  return {
    missionCount: preview.missions.length,
    slideCount,
    estimatedMinutes: preview.estimatedMinutes,
  };
}

export const SLIDE_KIND_LABELS: Record<CurriculumSlideKind, string> = {
  story: "Story",
  vocab: "Vocabulary",
  listen: "Listening",
  speak: "Speaking",
  practice: "Practice",
  quiz: "Quiz",
  reward: "Reward",
};
