import { NextResponse } from "next/server";

import { fetchLeaderboardSnapshot } from "@/lib/learn/fetch-leaderboard";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { safeServerAuthUser } from "@/lib/supabase/server";

export async function GET() {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  try {
    const sessionUser = await safeServerAuthUser();
    const snapshot = await fetchLeaderboardSnapshot(admin, sessionUser?.id ?? null);

    return NextResponse.json({
      ok: true,
      ...snapshot,
    });
  } catch (error) {
    console.error("[api/learn/leaderboard]", error);
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }
}
