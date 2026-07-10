import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountRole } from "@/lib/auth/account-hub-nav";

/** Who may play on /learn — guests (no login) or student accounts only. */
export function canPlayLearnAsRole(role: string | null | undefined): boolean {
  return !role || role === "student";
}

export async function getProfileRoleForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = data?.role;
  if (role === "parent" || role === "student" || role === "teacher") {
    return role;
  }
  return null;
}
