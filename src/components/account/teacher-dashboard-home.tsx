import Link from "next/link";
import { BookOpen, FileBarChart2, UserPlus, Users } from "lucide-react";

import educator from "./teacher-educator.module.css";

type Props = {
  displayName: string;
  email: string;
};

const ACTIONS = [
  {
    href: "/teacher/dashboard",
    label: "Classroom",
    hint: "Students, placement, and progress",
    icon: Users,
    tone: "sky" as const,
  },
  {
    href: "/teacher/reports",
    label: "Games report",
    hint: "Weekly summary + CSV download",
    icon: FileBarChart2,
    tone: "violet" as const,
  },
  {
    href: "/teacher/link-student",
    label: "Add student",
    hint: "Link a learner with their code",
    icon: UserPlus,
    tone: "emerald" as const,
  },
  {
    href: "/learn/library",
    label: "Preview library",
    hint: "Open the learner reading view",
    icon: BookOpen,
    tone: "amber" as const,
  },
] as const;

const TOOL_TONE_CLASS = {
  sky: educator.toolCardSky,
  violet: educator.toolCardViolet,
  emerald: educator.toolCardEmerald,
  amber: educator.toolCardAmber,
} as const;

export function TeacherDashboardHome({ displayName, email }: Props) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "E";

  return (
    <article className={educator.homePanel}>
      <header className={educator.homePanelHeader}>
        <div className={educator.homeProfile}>
          <div className={educator.homeAvatar} aria-hidden>
            {initial}
          </div>
          <div className={educator.homeProfileText}>
            <p className={`font-nunito ${educator.homeGreeting}`}>Good to see you</p>
            <h1 className={`font-fredoka ${educator.homeName}`}>{displayName}</h1>
            <p className={`font-nunito ${educator.homeEmail}`}>{email}</p>
          </div>
        </div>
        <div className={educator.homeStatus}>
          <span className={`font-nunito ${educator.statusChip}`}>Educator</span>
          <span className={`font-nunito ${educator.statusChip}`}>Classroom tools</span>
        </div>
      </header>

      <section className={educator.homePanelBody} aria-labelledby="educator-tools-title">
        <div className={educator.sectionIntro}>
          <h2 id="educator-tools-title" className={`font-fredoka ${educator.sectionTitle}`}>
            Your tools
          </h2>
          <p className={`font-nunito ${educator.sectionLead}`}>
            Everything you need to manage your classroom. Story library uploads are managed by Super Admin.
          </p>
        </div>

        <div className={educator.toolGrid}>
          {ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${educator.toolCard} ${TOOL_TONE_CLASS[item.tone]}`}
              >
                <span className={educator.toolIcon} aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <span className={educator.toolCopy}>
                  <span className={`font-nunito ${educator.toolLabel}`}>{item.label}</span>
                  <span className={`font-nunito ${educator.toolHint}`}>{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className={educator.homePanelFooter}>
        <p className={`font-nunito ${educator.footerNote}`}>
          Guardian Family Controls are for parents only. As an educator, use Classroom to support your learners.
        </p>
      </footer>
    </article>
  );
}
