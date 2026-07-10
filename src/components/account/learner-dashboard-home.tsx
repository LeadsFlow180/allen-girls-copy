"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Compass, ShieldCheck, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import studio from "./learner-account-studio.module.css";

type Props = {
  displayName: string;
  heroInitial: string;
  pointsBalance: number;
};

const SHORTCUTS: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  featured?: boolean;
}[] = [
  {
    href: "/learn/explore",
    label: "Learn",
    description: "World map, lessons, slides, and quizzes",
    icon: BookOpen,
    featured: true,
  },
  {
    href: "/learn/achievements",
    label: "Rewards",
    description: "Badges, streaks, and achievements",
    icon: Trophy,
  },
  {
    href: "/learn/placement",
    label: "Placement",
    description: "Find the right level to start",
    icon: Compass,
  },
];

export function LearnerDashboardHome({
  displayName,
  heroInitial,
  pointsBalance,
}: Props) {
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;

  return (
    <article className={studio.workspace} aria-labelledby="learner-home-title">
      <header className={studio.workspaceHero}>
        <div className={studio.heroMain}>
          <span className={studio.avatar} aria-hidden>
            {heroInitial}
          </span>
          <div className={studio.heroCopy}>
            <p className={studio.heroEyebrow}>Welcome back</p>
            <h1 id="learner-home-title" className={studio.heroTitle}>
              {firstName}
            </h1>
            <p className={studio.heroMeta}>Learner account · not shared with parents</p>
          </div>
        </div>
        <Link href="/learn/explore" className={studio.heroCta}>
          Continue learning
          <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
        </Link>
      </header>

      <div className={studio.metricsBar}>
        <Link href="/learn/achievements" className={studio.metricCell}>
          <span className={studio.metricLabel}>Total XP</span>
          <span className={studio.metricValue}>{pointsBalance.toLocaleString("en-US")}</span>
          <span className={studio.metricAction}>Open Rewards</span>
        </Link>
        <div className={studio.metricCellStatic}>
          <span className={studio.metricLabel}>Account</span>
          <span className={studio.metricValue}>Active</span>
          <span className={studio.metricMeta}>
            <ShieldCheck size={12} strokeWidth={2.5} aria-hidden />
            Verified learner
          </span>
        </div>
      </div>

      <nav className={studio.menuSection} aria-label="Learning shortcuts">
        <p className={studio.menuLabel}>Go to</p>
        <ul className={studio.menuList}>
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${studio.menuRow} ${item.featured ? studio.menuRowFeatured : ""}`}
                >
                  <span className={studio.rowIcon} aria-hidden>
                    <Icon size={17} strokeWidth={2.25} />
                  </span>
                  <span className={studio.menuRowText}>
                    <span className={studio.menuRowTitle}>{item.label}</span>
                    <span className={studio.menuRowDesc}>{item.description}</span>
                  </span>
                  <ChevronRight className={studio.menuChevron} size={18} strokeWidth={2} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className={studio.workspaceFoot}>
        Parents sign in separately to manage family settings. Use Home, Learn, and Rewards in the
        tabs above.
      </footer>
    </article>
  );
}
