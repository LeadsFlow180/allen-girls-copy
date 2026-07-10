"use client";

import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

import { LearnerAccountBackdrop } from "@/components/account/learner-account-backdrop";
import { LearnerAccountIntro } from "@/components/account/learner-account-intro";
import { LearnerAccountNav } from "@/components/account/learner-account-nav";
import { LearnerSignOutButton } from "@/components/account/learner-sign-out-button";

import studio from "./learner-account-studio.module.css";

type Props = {
  studentPending?: boolean;
  displayName?: string;
  children: React.ReactNode;
};

/** Learner account hub — unified card shell aligned with Family Controls. */
export function LearnerAccountShell({
  studentPending = false,
  displayName,
  children,
}: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/account";
  const firstName = displayName?.trim().split(/\s+/)[0];

  const hubTitle = studentPending
    ? "Account pending"
    : isHome && firstName
      ? `${firstName}'s dashboard`
      : "Learner dashboard";

  return (
    <div className={studio.page}>
      <LearnerAccountBackdrop />
      <div className={studio.shell}>
        <div className={studio.hubFrame}>
          <header className={studio.hubHeader}>
            <div className={studio.brandBlock}>
              <span className={studio.brandIconWrap} aria-hidden>
                <BookOpen size={20} strokeWidth={2.25} />
              </span>
              <div>
                <p className={studio.brandKicker}>Allen Girls Adventures</p>
                <h2 className={studio.brandTitle}>{hubTitle}</h2>
              </div>
            </div>
            <div className={studio.topBarActions}>
              <span className={studio.learnerBadge}>Learner account</span>
              <LearnerSignOutButton />
            </div>
          </header>

          <LearnerAccountNav studentPending={studentPending} />

          <main
            className={`${studio.hubBody} ${isHome ? studio.hubBodyHome : studio.hubBodyPad}`}
          >
            <LearnerAccountIntro studentPending={studentPending} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
