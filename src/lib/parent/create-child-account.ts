import type { SupabaseClient } from "@supabase/supabase-js";

export type CreateChildInput = {
  displayName: string;
  email: string;
  password: string;
};

export type CreateChildResult =
  | { ok: true; childUserId: string; email: string; displayName: string }
  | { ok: false; error: string };

/**
 * Creates a student auth user and links them to the parent as pre-approved.
 * Requires service-role Supabase client.
 */
export async function createChildAccountForParent(
  admin: SupabaseClient,
  parentUserId: string,
  input: CreateChildInput,
): Promise<CreateChildResult> {
  const displayName = input.displayName.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();

  if (!displayName) {
    return { ok: false, error: "display_name_required" };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "invalid_email" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "password_too_short" };
  }

  const { data: parentProfile } = await admin.from("profiles").select("role").eq("id", parentUserId).maybeSingle();

  if (parentProfile?.role !== "parent") {
    return { ok: false, error: "not_parent" };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: "student",
      display_name: displayName,
      guardian_created: true,
      created_by_parent_id: parentUserId,
    },
  });

  if (createError || !created.user) {
    const msg = createError?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered")) {
      return { ok: false, error: "email_in_use" };
    }
    return { ok: false, error: createError?.message ?? "create_failed" };
  }

  const childUserId = created.user.id;
  const approvedAt = new Date().toISOString();

  const { error: linkError } = await admin
    .from("student_profiles")
    .update({
      parent_user_id: parentUserId,
      parent_approved_at: approvedAt,
      guardian_created: true,
    })
    .eq("user_id", childUserId);

  if (linkError) {
    await admin.auth.admin.deleteUser(childUserId);
    return { ok: false, error: linkError.message };
  }

  await admin.from("profiles").update({ display_name: displayName }).eq("id", childUserId);

  return { ok: true, childUserId, email, displayName };
}
