import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Meet the Characters — Natalia, Alana, Maya & S.P.A.R.K.",
  description:
    "Meet the three Allen sisters — the Mind, the Voice, and the Heart — and S.P.A.R.K., their robotic best buddy. The heroes leading every learning adventure for grades 3–6.",
  alternates: { canonical: "/characters" },
};

export default function CharactersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
