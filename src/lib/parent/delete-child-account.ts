import type { SupabaseClient } from "@supabase/supabase-js";

export type DeleteChildResult =
  | { ok: true; childUserId: string; displayName: string }
  | { ok: false; error: string };

type DeleteStep = {
  table: string;
  column: string;
};

/** Tables keyed by the child's user id (profiles / auth.users id). */
const LEARNER_DATA_STEPS: DeleteStep[] = [
  { table: "learn_playback_progress", column: "learner_id" },
  { table: "learn_quiz_submissions", column: "learner_id" },
  { table: "learn_quest_progress", column: "learner_id" },
  { table: "placement_results", column: "student_user_id" },
  { table: "point_transactions", column: "student_user_id" },
  { table: "inventory", column: "student_user_id" },
  { table: "butterfly_sanctuary", column: "student_user_id" },
  { table: "passport_stamps", column: "student_user_id" },
  { table: "mission_checkpoints", column: "student_user_id" },
  { table: "skill_completions", column: "student_user_id" },
  { table: "module_completions", column: "student_user_id" },
  { table: "student_domain_tiers", column: "student_user_id" },
  { table: "teacher_students", column: "student_user_id" },
  { table: "points_wallet", column: "student_user_id" },
  { table: "daily_streaks", column: "student_user_id" },
  { table: "student_learning_path", column: "student_user_id" },
];

async function deleteRowsForChild(
  admin: SupabaseClient,
  childUserId: string,
  step: DeleteStep,
): Promise<void> {
  const { error } = await admin.from(step.table).delete().eq(step.column, childUserId);
  if (error && !isMissingTableError(error.message)) {
    console.error(`[delete-child] ${step.table}`, error.message);
    throw new Error(`delete_failed:${step.table}`);
  }
}

function isMissingTableError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("does not exist") || m.includes("42p01");
}

/**
 * Permanently removes a linked learner and all cloud progress (slides, quizzes, wallet, etc.).
 * Requires service-role client. Parent must own the link in student_profiles.
 */
export async function deleteChildAccountForParent(
  admin: SupabaseClient,
  parentUserId: string,
  childUserId: string,
): Promise<DeleteChildResult> {
  const { data: parentProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", parentUserId)
    .maybeSingle();

  if (parentProfile?.role !== "parent") {
    return { ok: false, error: "not_parent" };
  }

  const { data: link } = await admin
    .from("student_profiles")
    .select("user_id, parent_user_id")
    .eq("user_id", childUserId)
    .maybeSingle();

  if (!link || link.parent_user_id !== parentUserId) {
    return { ok: false, error: "child_not_linked" };
  }

  const { data: childProfile } = await admin
    .from("profiles")
    .select("display_name, role")
    .eq("id", childUserId)
    .maybeSingle();

  if (childProfile?.role !== "student") {
    return { ok: false, error: "not_a_student" };
  }

  const displayName = (childProfile.display_name as string) || "Learner";

  try {
    for (const step of LEARNER_DATA_STEPS) {
      await deleteRowsForChild(admin, childUserId, step);
    }

    const { error: studentProfileError } = await admin
      .from("student_profiles")
      .delete()
      .eq("user_id", childUserId);

    if (studentProfileError) {
      console.error("[delete-child] student_profiles", studentProfileError.message);
      return { ok: false, error: studentProfileError.message };
    }

    const { error: authError } = await admin.auth.admin.deleteUser(childUserId);
    if (authError) {
      console.error("[delete-child] auth", authError.message);
      return { ok: false, error: authError.message };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "delete_failed";
    return { ok: false, error: message };
  }

  return { ok: true, childUserId, displayName };
}
