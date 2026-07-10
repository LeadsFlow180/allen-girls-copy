import Link from "next/link";

import type { AccountRole } from "@/lib/auth/account-hub-nav";
import { GuardianAccountShell } from "@/components/account/guardian-account-shell";
import { LearnerAccountShell } from "@/components/account/learner-account-shell";
import { TeacherAccountShell } from "@/components/account/teacher-account-shell";

import styles from "./account-hub-shell.module.css";

type Props = {
  role: AccountRole;
  email: string;
  displayName?: string;
  studentPending?: boolean;
  children: React.ReactNode;
};

/** @deprecated Import role-specific shells directly to avoid pulling every hub into one page. */
export function AccountHubShell({
  role,
  email,
  studentPending = false,
  children,
}: Props) {
  if (role === "parent") {
    return <GuardianAccountShell>{children}</GuardianAccountShell>;
  }

  if (role === "student") {
    return (
      <LearnerAccountShell studentPending={studentPending}>{children}</LearnerAccountShell>
    );
  }

  return <TeacherAccountShell email={email}>{children}</TeacherAccountShell>;
}

export function AccountAccessDenied({ role, message }: { role: AccountRole; message: string }) {
  const home = role === "parent" ? "/account" : role === "teacher" ? "/account" : "/account/pending-approval";
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.denied}>
          <h1 className={styles.deniedTitle}>This page isn&apos;t for your account</h1>
          <p className={styles.deniedText}>{message}</p>
          <Link href={home} className={styles.deniedLink}>
            Go to your home →
          </Link>
        </div>
      </div>
    </div>
  );
}
