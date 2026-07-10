import { redirect } from "next/navigation";

import { GuardianAccountShell } from "@/components/account/guardian-account-shell";
import { ApproveLearnerForm } from "@/components/account/approve-learner-form";
import { requireParentAccount } from "@/lib/auth/require-account-role";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ApproveLearnerPage() {
  if (!isSupabaseConfigured()) redirect("/account");

  await requireParentAccount();

  return (
    <GuardianAccountShell>
      <ApproveLearnerForm />
    </GuardianAccountShell>
  );
}
