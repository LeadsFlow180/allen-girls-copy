import type { CSSProperties } from "react";

/** Duolingo-inspired tokens for /learn/explore — playful, chunky, high-contrast. */
export const EXPLORE = {
  green: "#58cc02",
  greenDark: "#46a302",
  greenLight: "#d7ffb8",
  sky: "#1cb0f6",
  skyDark: "#1899d6",
  streak: "#ff9600",
  streakDark: "#e68600",
  gem: "#1cb0f6",
  heart: "#ff4b4b",
  heartDark: "#ea2b2b",
  xp: "#ffc800",
  locked: "#e5e5e5",
  lockedRing: "#afafaf",
  text: "#3c3c3c",
  textMuted: "#777777",
  card: "#ffffff",
  pathBg: "#dff6d0",
  purple: "#7c22c5",
  purpleDark: "#5a18a0",
  purpleLight: "#f3e8ff",
  pink: "#e8357a",
  /** Kept for inline fallbacks; explore page uses LearnAmbientBackground instead. */
  pageGradient:
    "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 32%, #e0f2fe 58%, #dcfce7 100%)",
} as const;

export function chunkyShadow(base: string, depth = 4): CSSProperties {
  return {
    boxShadow: `0 ${depth}px 0 ${base}, 0 ${depth + 6}px 16px rgba(15, 23, 42, 0.12)`,
  };
}

export function pill3D(
  bg: string,
  shadow: string,
): CSSProperties {
  return {
    background: bg,
    border: "none",
    borderRadius: 999,
    ...chunkyShadow(shadow, 3),
  };
}
