import Link from "next/link";
import { redirect } from "next/navigation";

import { GuardianAccountShell } from "@/components/account/guardian-account-shell";
import { GuardianDashboardHome } from "@/components/account/guardian-dashboard-home";
import { LearnerAccountShell } from "@/components/account/learner-account-shell";
import { LearnerDashboardHome } from "@/components/account/learner-dashboard-home";
import { TeacherDashboardHome } from "@/components/account/teacher-dashboard-home";
import { TeacherAccountShell } from "@/components/account/teacher-account-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getBalance } from "@/lib/rewards/points-engine";
import { requireSignedInAccount } from "@/lib/auth/require-account-role";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function SetupNotice() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.setupCard}>
          <h1 className={styles.setupTitle}>Accounts not connected yet</h1>
          <p className={styles.setupText}>
            Add Supabase keys to <code>.env.local</code> and run{" "}
            <code>src/data/supabase/001_initial_schema.sql</code>.
          </p>
          <Link href="/" className={styles.setupLink}>
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AccountHomePage() {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/");

  const session = await requireSignedInAccount();

  if (session.studentPending) {
    redirect("/account/pending-approval");
  }

  let pointsBalance = 0;

  if (session.role === "student") {
    pointsBalance = await getBalance(supabase, session.userId).catch(() => 0);
  }

  const heroInitial =
    session.displayName.trim().charAt(0).toUpperCase() || "H";

  if (session.role === "student") {
    return (
      <LearnerAccountShell displayName={session.displayName}>
        <LearnerDashboardHome
          displayName={session.displayName}
          heroInitial={heroInitial}
          pointsBalance={pointsBalance}
        />
      </LearnerAccountShell>
    );
  }

  if (session.role === "super_admin") {
    redirect("/admin");
  }

  if (session.role === "parent") {
    return (
      <GuardianAccountShell>
        <GuardianDashboardHome displayName={session.displayName} email={session.email} />
      </GuardianAccountShell>
    );
  }

  return (
    <TeacherAccountShell email={session.email}>
      <TeacherDashboardHome displayName={session.displayName} email={session.email} />
    </TeacherAccountShell>
  );
}
