import { redirect } from "next/navigation";

import { getStudentApprovalStatus } from "@/lib/auth/student-approval";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Reward store progress is per student account — require guardian approval first. */
export default async function RewardsLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return children;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return children;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  const approval = await getStudentApprovalStatus(supabase, user.id);
  if (approval.isStudent && !approval.isApproved) {
    redirect("/account/pending-approval");
  }

  return children;
}
