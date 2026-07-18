import Link from "next/link";
import {
  BarChart3,
  FileBarChart2,
  KeyRound,
  Lock,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GuardianHomeStats } from "@/components/account/guardian-home-stats";

import guardian from "./guardian-family-controls.module.css";

type Props = {
  displayName: string;
  email: string;
};

type ToolTone = "violet" | "sky" | "emerald" | "amber";

const ACTIONS: {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: ToolTone;
}[] = [
  {
    href: "/parent/children",
    label: "Family profiles",
    hint: "View and manage learners on your account",
    icon: Users,
    tone: "violet",
  },
  {
    href: "/parent/children/new",
    label: "Add learner",
    hint: "Create a child sign-in with email and password",
    icon: UserPlus,
    tone: "sky",
  },
  {
    href: "/parent/dashboard",
    label: "Progress dashboard",
    hint: "Slides, quizzes, placement, and activity",
    icon: BarChart3,
    tone: "emerald",
  },
  {
    href: "/parent/reports",
    label: "Games report",
    hint: "Weekly summary + CSV download",
    icon: FileBarChart2,
    tone: "amber",
  },
  {
    href: "/account/approve-learner",
    label: "Approve code",
    hint: "Link a child who signed up on their own",
    icon: KeyRound,
    tone: "amber",
  },
];

const TOOL_TONE_CLASS = {
  violet: guardian.toolCardViolet,
  sky: guardian.toolCardSky,
  emerald: guardian.toolCardEmerald,
  amber: guardian.toolCardAmber,
} as const;

const GUIDE_STEPS = [
  "Open Family profiles to see every learner linked to your account.",
  "Use Add learner to create a sign-in, or Approve code if they enrolled themselves.",
  "Check Progress dashboard and Games report for activity and downloads.",
] as const;

/** Guardian home — server-rendered so updates appear without a stale client bundle. */
export function GuardianDashboardHome({ displayName, email }: Props) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "G";

  return (
    <article className={guardian.homePanel}>
      <header className={guardian.homePanelHeader}>
        <div className={guardian.homeProfile}>
          <div className={guardian.homeAvatar} aria-hidden>
            {initial}
          </div>
          <div className={guardian.homeProfileText}>
            <p className={guardian.homeGreeting}>Welcome back</p>
            <h1 className={guardian.homeName}>{displayName}</h1>
            <p className={guardian.homeEmail}>{email}</p>
          </div>
        </div>

        <div className={guardian.homeStatus}>
          <span className={guardian.statusChip}>
            <ShieldCheck size={13} strokeWidth={2.25} aria-hidden />
            Guardian account
          </span>
          <span className={guardian.statusChipMuted}>
            <Lock size={12} strokeWidth={2.25} aria-hidden />
            Private login
          </span>
        </div>

        <GuardianHomeStats />
      </header>

      <section className={guardian.homePanelBody} aria-labelledby="guardian-tools-title">
        <div className={guardian.sectionIntro}>
          <h2 id="guardian-tools-title" className={guardian.sectionTitle}>
            Your tools
          </h2>
          <p className={guardian.sectionLead}>
            Manage learners, track learning activity, and approve self-enrolled children.
          </p>
        </div>

        <div className={guardian.toolGrid}>
          {ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${guardian.toolCard} ${TOOL_TONE_CLASS[item.tone]}`}
              >
                <span className={guardian.toolIcon} aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <span className={guardian.toolCopy}>
                  <span className={guardian.toolLabel}>{item.label}</span>
                  <span className={guardian.toolHint}>{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={guardian.homeGuide} aria-labelledby="guardian-guide-title">
        <h2 id="guardian-guide-title" className={guardian.guideTitle}>
          Getting started
        </h2>
        <ol className={guardian.guideList}>
          {GUIDE_STEPS.map((step, index) => (
            <li key={step} className={guardian.guideItem}>
              <span className={guardian.guideStep} aria-hidden>
                {index + 1}
              </span>
              <span className={guardian.guideText}>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className={guardian.homePanelFooter}>
        <p className={guardian.footerNote}>
          <Lock size={14} strokeWidth={2.25} className={guardian.footerIcon} aria-hidden />
          Children never use your guardian login. Each learner signs in with their own email and
          password.
        </p>
      </footer>
    </article>
  );
}
