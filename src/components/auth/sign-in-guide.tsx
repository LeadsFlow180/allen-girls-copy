"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./account-auth.module.css";

export type SignInAudience = "parent" | "kid" | "teacher" | "admin";

const GUIDES: Record<
  SignInAudience,
  { emoji: string; label: string; title: string; steps: string[]; note: string; tabClass: string; guideClass: string }
> = {
  parent: {
    emoji: "💜",
    label: "Guardian",
    title: "Parent / guardian sign-in",
    steps: [
      "Use only your guardian email and password — not your child’s learner login.",
      "Kids sign in on the Learner tab with their own email (created under Family profiles).",
      "After sign-in, open Family profiles to add children or view progress.",
    ],
    note: "New here? Create account → pick “Parent / guardian” → then add kids from Family profiles.",
    tabClass: styles.tabActiveParent,
    guideClass: styles.guideParent,
  },
  kid: {
    emoji: "🎒",
    label: "Learner",
    title: "Kid / learner sign-in",
    steps: [
      "Use the email and password your parent gave you (from Family profiles).",
      "Or, if you signed up yourself, use the email and password you created.",
      "If learning is locked, ask your parent to approve your learner code first.",
    ],
    note: "Don’t have an account? Ask your parent to create one for you — that’s the fastest way to start.",
    tabClass: styles.tabActiveKid,
    guideClass: styles.guideKid,
  },
  teacher: {
    emoji: "🏫",
    label: "Teacher",
    title: "Teacher sign-in",
    steps: [
      "Use the school email and password from your teacher account signup.",
      "No guardian approval is needed for teachers.",
      "After sign-in, open your Classroom dashboard to link students.",
    ],
    note: "New teacher? Sign up and choose “Teacher” on the create account page.",
    tabClass: styles.tabActiveTeacher,
    guideClass: styles.guideTeacher,
  },
  admin: {
    emoji: "🛡️",
    label: "Super Admin",
    title: "Super Admin sign-in",
    steps: [
      "Use the email and password for your Super Admin account.",
      "Super Admin access is granted by platform administration — there is no public signup.",
      "After sign-in, you can manage all users, progress, and library stories.",
    ],
    note: "Need access? Ask your platform administrator to approve your account.",
    tabClass: styles.tabActiveAdmin,
    guideClass: styles.guideAdmin,
  },
};

type SignInGuideProps = {
  audience: SignInAudience;
  onAudienceChange: (audience: SignInAudience) => void;
};

export function SignInGuide({ audience, onAudienceChange }: SignInGuideProps) {
  const guide = GUIDES[audience];

  return (
    <>
      <p className={styles.whoLabel}>Who is signing in?</p>
      <div className={styles.tabs} role="tablist" aria-label="Who is signing in">
        {(Object.keys(GUIDES) as SignInAudience[]).map((key) => {
          const g = GUIDES[key];
          const active = audience === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? g.tabClass : ""}`}
              onClick={() => onAudienceChange(key)}
            >
              <span aria-hidden>{g.emoji}</span> {g.label}
            </button>
          );
        })}
      </div>

      <div className={`${styles.guide} ${guide.guideClass}`} role="tabpanel">
        <p className={styles.guideTitle}>{guide.title}</p>
        <ol className={styles.steps}>
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className={styles.note}>{guide.note}</p>
      </div>

      {audience === "parent" && (
        <div className={styles.footerLinks}>
          <Link href="/account/signup" className={styles.footerLink}>
            Create guardian account
          </Link>
          <Link href="/parent/children" className={styles.footerLink}>
            Family profiles
          </Link>
        </div>
      )}
      {audience === "kid" && (
        <div className={styles.footerLinks}>
          <Link href="/account/signup" className={styles.footerLink}>
            I need my own account
          </Link>
          <Link href="/account/pending-approval" className={styles.footerLinkMuted}>
            Waiting for parent approval?
          </Link>
        </div>
      )}
      {audience === "teacher" && (
        <div className={styles.footerLinks}>
          <Link href="/account/signup" className={styles.footerLink}>
            Create teacher account
          </Link>
          <Link href="/teacher/dashboard" className={styles.footerLinkMuted}>
            Classroom dashboard
          </Link>
        </div>
      )}
      {audience === "admin" && (
        <div className={styles.footerLinks}>
          <Link href="/admin" className={styles.footerLink}>
            Super Admin dashboard
          </Link>
          <Link href="/admin/login" className={styles.footerLinkMuted}>
            Dedicated admin login page
          </Link>
        </div>
      )}
    </>
  );
}

export function useSignInAudience(defaultAudience: SignInAudience = "parent") {
  return useState<SignInAudience>(defaultAudience);
}
