import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Choose Your World — 8 Learning Adventure Worlds",
  description:
    "Pick a world and start the mission: from prehistoric frontiers to future cities, every Allen Girls Adventures world turns grade 3–6 learning into the key that opens the door.",
  alternates: { canonical: "/worlds" },
};

export default function WorldsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
