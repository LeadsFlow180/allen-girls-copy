"use client";

import { BookOpen, Clock, Compass, Home, Trophy, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  account: Home,
  learn: BookOpen,
  achievements: Trophy,
  pending: Clock,
  placement: Compass,
};

type Props = {
  navId: string;
  className?: string;
};

export function LearnerHubNavIcon({ navId, className }: Props) {
  const Icon = ICONS[navId] ?? Home;
  return <Icon className={className} aria-hidden strokeWidth={2.25} />;
}
