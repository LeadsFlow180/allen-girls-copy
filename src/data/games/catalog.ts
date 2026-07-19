import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Bird,
  Cat,
  CircleDot,
  Cpu,
  Fish,
  Mountain,
  Palette,
  School,
  Sparkles,
} from "lucide-react";

export type GameKind = "native" | "iframe";

// ── GAME-MASTER-SPEC §2 fields ─────────────────────────────────────────
export type GameClass = "academic" | "arcade";
export type IntegrationMode = "overlay" | "native";
export type WrongAnswerPolicy = "soft" | "gate";

export type QuestionCadence = {
  kind: "per_checkpoint" | "per_minutes" | "per_level";
  value: number;
};

export type GameCatalogEntry = {
  id: string;
  title: string;
  description: string;
  kind: GameKind;
  href: string;
  available: boolean;
  icon: LucideIcon;
  /** GAME-MASTER-SPEC: 'academic' asks curriculum questions + earns real points; 'arcade' is pure fun */
  gameClass: GameClass;
  /** How questions get in — academic games only */
  integration?: IntegrationMode;
  /** 'soft' (play continues) or 'gate' (blocks until correct) — academic only */
  wrongAnswerPolicy?: WrongAnswerPolicy;
  /** Curriculum skills practiced (content-bank skill IDs) — required non-empty for academic */
  skillIds: string[];
  gradeLevels: number[];
  subjects: Array<"ela" | "math">;
  /** How often a question appears — academic only */
  questionCadence?: QuestionCadence;
  /**
   * Adventure world this academic game belongs to (globe).
   * Academic games live inside worlds — Game Zone only features them with a
   * "find it here" notice, they are not arcade free-play cards.
   */
  world?: {
    slug: string;
    name: string;
    emoji: string;
  };
  /** Short label shown on the card badge */
  badge: string;
  /** CSS gradient for card background (fallback under cover art) */
  gradient: string;
  /** Accent color for borders, glow, and CTA */
  accent: string;
  /** Emoji fallback if cover art fails to load */
  emoji: string;
  /** Promotional cover image shown on Game Zone cards */
  coverImage: string;
  /** iframe embed URL — only for kind: "iframe" */
  embedUrl?: string;
  /** Suggested iframe height in px */
  embedHeight?: number;
};

export const GAME_CATALOG: GameCatalogEntry[] = [
  // ── Academic (curriculum questions + wallet points) ───────────────────
  {
    id: "jurassic-journey",
    gameClass: "academic",
    integration: "native",
    wrongAnswerPolicy: "soft",
    skillIds: ["SK-M3-101"],
    gradeLevels: [3, 4, 5],
    subjects: ["math"],
    questionCadence: { kind: "per_checkpoint", value: 1 },
    title: "Jurassic Journey",
    description:
      "Roll a gyrosphere through 8 volcanic levels — math checkpoints power the escape!",
    kind: "iframe",
    /** Feature card points kids to the adventure world, not arcade free-play */
    href: "/worlds/fossil-frontier",
    available: true,
    icon: Mountain,
    badge: "Academic · Math",
    world: {
      slug: "fossil-frontier",
      name: "Fossil Frontier",
      emoji: "🦕",
    },
    gradient: "linear-gradient(145deg, #180f28 0%, #2a1848 45%, #0d6b73 100%)",
    accent: "#2ee6ef",
    emoji: "🌋",
    coverImage: "/games/covers/jurassic-journey.png",
    embedUrl: "/games/jurassic-journey/index.html",
    embedHeight: 720,
  },
  {
    id: "screen-hop",
    gameClass: "academic",
    integration: "native",
    wrongAnswerPolicy: "soft",
    skillIds: [
      "SK-M3-101", "SK-M3-102", "SK-M3-103", "SK-M3-104", "SK-M3-105",
      "SK-M4-301", "SK-M4-302", "SK-M4-303", "SK-M4-304", "SK-M4-305",
      "SK-FR-501", "SK-FR-502", "SK-FR-503", "SK-FR-504", "SK-FR-505",
      "SK-RP-601", "SK-RP-602", "SK-RP-603", "SK-RP-604", "SK-RP-605",
    ],
    gradeLevels: [3, 4, 5, 6],
    subjects: ["math", "ela"],
    questionCadence: { kind: "per_checkpoint", value: 1 },
    title: "Screen Hop 3D",
    description:
      "Dive inside Futuria's computer! Cross 8 neon sectors, solve learning checkpoints to recover the Master Key, and out-think The Glitcher.",
    kind: "iframe",
    /** Feature card points kids to the adventure world, not arcade free-play */
    href: "/worlds/futuria-world",
    available: true,
    icon: Cpu,
    badge: "Academic · Multi-subject",
    world: {
      slug: "futuria-world",
      name: "Futuria World",
      emoji: "🤖",
    },
    gradient: "linear-gradient(145deg, #180f28 0%, #2a1848 45%, #be185d 100%)",
    accent: "#ff4fb4",
    emoji: "👾",
    coverImage: "/games/covers/screen-hop.png",
    embedUrl: "/games/screen-hop/index.html",
    embedHeight: 720,
  },

  // ── Arcade (iframe Unity / WebGL / HTML) ───────────────────────────────
  {
    id: "moto-rush",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Moto Rush",
    description:
      "Lean in, hold the line! Race 3D motorcycles, collect rings, and beat rival riders across desert tracks.",
    kind: "iframe",
    href: "/games/play/moto-rush",
    available: true,
    icon: Bike,
    badge: "Just for Fun",
    gradient: "linear-gradient(145deg, #1a0a00 0%, #7c2d12 45%, #ea580c 100%)",
    accent: "#ff4500",
    emoji: "🏍️",
    coverImage: "/games/covers/moto-rush.png",
    embedUrl: "/games/moto-rush/index.html",
    embedHeight: 720,
  },
  {
    id: "fin-feast",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Fin Feast",
    description:
      "You're a tiny fish — eat smaller fish, dodge bigger ones, grow through 9 stages, then face the Great White!",
    kind: "iframe",
    href: "/games/play/fin-feast",
    available: true,
    icon: Fish,
    badge: "Just for Fun",
    gradient: "linear-gradient(145deg, #0c4a6e 0%, #0369a1 45%, #0e7490 100%)",
    accent: "#22d3ee",
    emoji: "🐠",
    coverImage: "/games/covers/fin-feast.png",
    embedUrl: "/games/fin-feast/index.html",
    embedHeight: 720,
  },
  {
    id: "penguin-flapper",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Penguin Flapper",
    description: "Tap to fly! Dodge icy obstacles and soar through the arctic sky.",
    kind: "iframe",
    href: "/games/play/penguin-flapper",
    available: true,
    icon: Bird,
    badge: "Unity Arcade",
    gradient: "linear-gradient(145deg, #0ea5e9 0%, #0369a1 55%, #1e3a8a 100%)",
    accent: "#38bdf8",
    emoji: "🐧",
    coverImage: "/games/covers/penguin-flapper.png",
    embedUrl: "https://neon-semifreddo-a0a119.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "skid-runner",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Skid Runner",
    description: "Run, jump, and explore as a brave cat on a 2D platform adventure!",
    kind: "iframe",
    href: "/games/play/skid-runner",
    available: true,
    icon: Cat,
    badge: "Unity Arcade",
    gradient: "linear-gradient(145deg, #f97316 0%, #ea580c 55%, #9a3412 100%)",
    accent: "#fb923c",
    emoji: "🐱",
    coverImage: "/games/covers/skid-runner.png",
    embedUrl: "https://classy-torte-710428.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "bike-wheel",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Bike Wheel",
    description: "Pop wheelies and race through tricky tracks on your moto bike!",
    kind: "iframe",
    href: "/games/play/bike-wheel",
    available: true,
    icon: Bike,
    badge: "Unity Arcade",
    gradient: "linear-gradient(145deg, #22c55e 0%, #16a34a 55%, #14532d 100%)",
    accent: "#4ade80",
    emoji: "🏍️",
    coverImage: "/games/covers/bike-wheel.png",
    embedUrl: "https://glowing-dasik-41c0bf.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "town-school",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Town School",
    description: "Explore a lively town school — discover, learn, and play along the way!",
    kind: "iframe",
    href: "/games/play/town-school",
    available: true,
    icon: School,
    badge: "Unity Arcade",
    gradient: "linear-gradient(145deg, #a855f7 0%, #7c3aed 55%, #4c1d95 100%)",
    accent: "#c084fc",
    emoji: "🏫",
    coverImage: "/games/covers/town-school.png",
    embedUrl: "https://storied-bavarois-6f2509.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "dot-physics",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Dot Physics",
    description: "Use physics and clever moves to roll the ball into the jar!",
    kind: "iframe",
    href: "/games/play/dot-physics",
    available: true,
    icon: CircleDot,
    badge: "Unity Arcade",
    gradient: "linear-gradient(145deg, #ec4899 0%, #db2777 45%, #7c22c5 100%)",
    accent: "#f472b6",
    emoji: "⚗️",
    coverImage: "/games/covers/dot-physics.png",
    embedUrl: "https://calm-starlight-cbec40.netlify.app/",
    embedHeight: 640,
  },

  // ── Creative (native in-app games) ────────────────────────────────────
  {
    id: "butterfly-lab",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Butterfly Sisters Color Lab",
    description: "Pick a color and tap numbered sections on the butterfly!",
    kind: "native",
    href: "/games/butterfly-lab",
    available: true,
    icon: Sparkles,
    badge: "Color & Create",
    gradient: "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 55%, #ddd6fe 100%)",
    accent: "#7c22c5",
    emoji: "🦋",
    coverImage: "/games/covers/butterfly-lab.png",
  },
  {
    id: "color-quest",
    gameClass: "arcade",
    skillIds: [],
    gradeLevels: [3, 4, 5, 6],
    subjects: [],
    title: "Color Quest",
    description: "Color by numbers to light up magical scenes.",
    kind: "native",
    href: "/games/color-quest",
    available: true,
    icon: Palette,
    badge: "Color & Create",
    gradient: "linear-gradient(145deg, #fdf2f8 0%, #fce7f3 55%, #fbcfe8 100%)",
    accent: "#e8357a",
    emoji: "🎨",
    coverImage: "/games/covers/color-quest.png",
  },
];

export const ACADEMIC_GAMES = GAME_CATALOG.filter((g) => g.gameClass === "academic");
export const ARCADE_GAMES = GAME_CATALOG.filter(
  (g) => g.gameClass === "arcade" && g.kind === "iframe",
);
export const CREATIVE_GAMES = GAME_CATALOG.filter(
  (g) => g.gameClass === "arcade" && g.kind === "native",
);

export function getGameById(id: string): GameCatalogEntry | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}

/** Academic adventure games that belong to a specific globe world */
export function getAcademicGamesForWorld(worldSlug: string): GameCatalogEntry[] {
  return ACADEMIC_GAMES.filter((g) => g.world?.slug === worldSlug && g.available);
}

export function getIframeGameById(id: string): GameCatalogEntry | undefined {
  const game = getGameById(id);
  return game?.kind === "iframe" ? game : undefined;
}

/** Plain serializable shape safe to pass from Server → Client Components */
export type IframeGameData = {
  id: string;
  title: string;
  description: string;
  badge: string;
  accent: string;
  emoji: string;
  embedUrl: string;
  embedHeight: number;
  gameClass: GameClass;
  worldSlug?: string;
};

export function toIframeGameData(game: GameCatalogEntry): IframeGameData {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    badge: game.badge,
    accent: game.accent,
    emoji: game.emoji,
    embedUrl: game.embedUrl ?? "",
    embedHeight: game.embedHeight ?? 640,
    gameClass: game.gameClass,
    worldSlug: game.world?.slug,
  };
}
