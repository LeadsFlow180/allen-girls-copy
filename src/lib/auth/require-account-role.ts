import { redirect } from "next/navigation";

import type { AccountRole } from "@/lib/auth/account-hub-nav";
import { getStudentApprovalStatus } from "@/lib/auth/student-approval";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SessionAccount = {
  userId: string;
  email: string;
  role: AccountRole;
  displayName: string;
  studentPending: boolean;
};

/** Loads session + role; redirects to login if missing. */
export async function requireSignedInAccount(): Promise<SessionAccount> {
  if (!isSupabaseConfigured()) {
    redirect("/account");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/account/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as AccountRole) ?? "student";
  const approval = await getStudentApprovalStatus(supabase, user.id);
  const studentPending = approval.isStudent && !approval.isApproved;

  return {
    userId: user.id,
    email: user.email,
    role,
    displayName: profile?.display_name?.trim() || "Account",
    studentPending,
  };
}

/** Redirects if role not allowed. Students pending approval go to waiting page. */
export async function requireAccountRole(allowed: AccountRole[]): Promise<SessionAccount> {
  const session = await requireSignedInAccount();

  if (!allowed.includes(session.role)) {
    redirect("/account");
  }

  if (session.role === "student" && session.studentPending && !allowed.includes("student")) {
    redirect("/account/pending-approval");
  }

  return session;
}

export async function requireParentAccount(): Promise<SessionAccount> {
  const session = await requireSignedInAccount();
  if (session.role !== "parent") {
    redirect("/account");
  }
  return session;
}

export async function requireApprovedStudent(): Promise<SessionAccount> {
  const session = await requireSignedInAccount();
  if (session.role !== "student") {
    redirect("/account");
  }
  if (session.studentPending) {
    redirect("/account/pending-approval");
  }
  return session;
}

export async function requireTeacherAccount(): Promise<SessionAccount> {
  const session = await requireSignedInAccount();
  if (session.role !== "teacher") {
    redirect("/account");
  }
  return session;
}

export async function requireSuperAdminAccount(): Promise<SessionAccount> {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "super_admin") {
    redirect("/admin/login");
  }

  return {
    userId: user.id,
    email: user.email,
    role: "super_admin",
    displayName: profile?.display_name?.trim() || "Super Admin",
    studentPending: false,
  };
}
