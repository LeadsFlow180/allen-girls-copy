import { NextResponse } from "next/server";

import { fetchAdminUserDirectory } from "@/lib/admin/fetch-admin-users";
import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  try {
    const users = await fetchAdminUserDirectory(admin);
    return NextResponse.json({ ok: true, users, total: users.length });
  } catch (error) {
    console.error("[api/admin/users]", error);
    return NextResponse.json({ error: "database_error" }, { status: 500 });
  }
}
