import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Adventures & Episodes for Kids in Grades 3–6",
  description:
    "Explore Allen Girls Adventures episodes — missions across amazing worlds where math, reading, and science skills unlock the story.",
  alternates: { canonical: "/episodes" },
};

export default function EpisodesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
