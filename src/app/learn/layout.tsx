import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LearnProgressBinder } from "@/components/learn/learn-progress-binder";
import { isLearnLibraryPath } from "@/lib/learn/learn-route-paths";
import { getProfileRoleForUser } from "@/lib/auth/learn-route-access";
import { getStudentApprovalStatus } from "@/lib/auth/student-approval";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Learn hub + classroom routes are for learners only.
 * Library Labyrinth (/learn/library) is public Story Time — all roles and guests.
 */
export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (isLearnLibraryPath(pathname)) {
    return <>{children}</>;
  }

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

  const role = await getProfileRoleForUser(supabase, user.id);
  if (role === "parent") {
    redirect("/parent/dashboard");
  }
  if (role === "teacher") {
    redirect("/teacher/dashboard");
  }
  if (role === "super_admin") {
    redirect("/admin");
  }

  const approval = await getStudentApprovalStatus(supabase, user.id);
  if (approval.isStudent && !approval.isApproved) {
    redirect("/account/pending-approval");
  }

  return (
    <>
      <LearnProgressBinder />
      {children}
    </>
  );
}
