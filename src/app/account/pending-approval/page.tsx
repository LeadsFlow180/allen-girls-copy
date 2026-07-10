import { redirect } from "next/navigation";

import { LearnerAccountShell } from "@/components/account/learner-account-shell";
import { getStudentApprovalStatus } from "@/lib/auth/student-approval";
import { requireSignedInAccount } from "@/lib/auth/require-account-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import styles from "./page.module.css";

export default async function PendingApprovalPage() {
  if (!isSupabaseConfigured()) redirect("/account");

  const session = await requireSignedInAccount();
  if (session.role !== "student") redirect("/account");

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/");

  const approval = await getStudentApprovalStatus(supabase, session.userId);
  if (approval.isApproved) redirect("/account");

  return (
    <LearnerAccountShell studentPending>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Approval code</h2>
        <p className={styles.cardText}>
          Give this code to your parent or guardian. They enter it in Family Controls to activate your
          account.
        </p>
        <p className={styles.code}>{approval.approvalCode ?? "—"}</p>
      </section>

      <section className={styles.cardMuted}>
        <p className={styles.cardText}>
          Learn and Rewards stay locked until approval is complete. After that, use the{" "}
          <strong>Learn</strong> tab above.
        </p>
      </section>

      <p className={styles.footerNote}>
        Parents sign in with a guardian account, then open <strong>Code</strong> under Family Controls.
      </p>
    </LearnerAccountShell>
  );
}
