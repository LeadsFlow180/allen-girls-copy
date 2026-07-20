import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Learning Games for Grades 3–6 — Power Up & Play",
  description:
    "Educational games where the learning IS the game: standards-aligned math, reading, and science challenges built into adventures kids choose to play.",
  alternates: { canonical: "/games" },
};

export default function GamesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
