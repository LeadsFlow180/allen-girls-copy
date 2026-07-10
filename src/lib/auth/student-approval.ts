import type { SupabaseClient } from "@supabase/supabase-js";

export type StudentApprovalStatus = {
  isStudent: boolean;
  isApproved: boolean;
  approvalCode: string | null;
  guardianCreated: boolean;
  parentApprovedAt: string | null;
};

/** Returns approval state for the signed-in user (non-students are treated as approved). */
export async function getStudentApprovalStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<StudentApprovalStatus> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();

  if (profile?.role !== "student") {
    return {
      isStudent: false,
      isApproved: true,
      approvalCode: null,
      guardianCreated: false,
      parentApprovedAt: null,
    };
  }

  const { data: sp } = await supabase
    .from("student_profiles")
    .select("approval_code, parent_approved_at, guardian_created")
    .eq("user_id", userId)
    .maybeSingle();

  const parentApprovedAt = (sp?.parent_approved_at as string | null) ?? null;

  return {
    isStudent: true,
    isApproved: Boolean(parentApprovedAt),
    approvalCode: (sp?.approval_code as string | null) ?? null,
    guardianCreated: Boolean(sp?.guardian_created),
    parentApprovedAt,
  };
}
