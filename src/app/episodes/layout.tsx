import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "See the Show — Allen Girls Adventures Episodes",
  description:
    "Watch Allen Girls Adventures episodes — the YouTube series where Natalia, Alana, Maya, and S.P.A.R.K. turn learning into quests kids want to follow.",
  alternates: { canonical: "/episodes" },
};

export default function EpisodesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
