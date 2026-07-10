import type { LucideIcon } from "lucide-react";
import { Bike, Bird, Cat, CircleDot, Palette, School, Sparkles } from "lucide-react";

export type GameKind = "native" | "iframe";

export type GameCatalogEntry = {
  id: string;
  title: string;
  description: string;
  kind: GameKind;
  href: string;
  available: boolean;
  icon: LucideIcon;
  /** Short label shown on the card badge */
  badge: string;
  /** CSS gradient for card background */
  gradient: string;
  /** Accent color for borders, glow, and CTA */
  accent: string;
  /** Emoji or symbol for the card art area */
  emoji: string;
  /** iframe embed URL — only for kind: "iframe" */
  embedUrl?: string;
  /** Suggested iframe height in px */
  embedHeight?: number;
};

export const GAME_CATALOG: GameCatalogEntry[] = [
  // ── Arcade (iframe Unity / WebGL) ─────────────────────────────────────
  {
    id: "penguin-flapper",
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
    embedUrl: "https://neon-semifreddo-a0a119.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "skid-runner",
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
    embedUrl: "https://classy-torte-710428.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "bike-wheel",
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
    embedUrl: "https://glowing-dasik-41c0bf.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "town-school",
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
    embedUrl: "https://storied-bavarois-6f2509.netlify.app/",
    embedHeight: 640,
  },
  {
    id: "dot-physics",
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
    embedUrl: "https://calm-starlight-cbec40.netlify.app/",
    embedHeight: 640,
  },

  // ── Creative (native in-app games) ────────────────────────────────────
  {
    id: "butterfly-lab",
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
  },
  {
    id: "color-quest",
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
  },
];

export const ARCADE_GAMES = GAME_CATALOG.filter((g) => g.kind === "iframe");
export const CREATIVE_GAMES = GAME_CATALOG.filter((g) => g.kind === "native");

export function getGameById(id: string): GameCatalogEntry | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
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
  };
}
