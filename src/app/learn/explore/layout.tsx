import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Explore Learning Missions for Grades 3–6",
  description:
    "Explore standards-aligned learning missions across math, reading, and science — the interactive path where grade 3–6 skills power the next part of the adventure.",
  alternates: { canonical: "/learn/explore" },
};

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
