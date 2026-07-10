import { NextResponse } from "next/server";

import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { seedLibraryStories } from "@/lib/library/seed-library-catalog";

export async function POST(request: Request) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  let ids: string[] | undefined;
  try {
    const body = (await request.json()) as { ids?: string[] };
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      ids = body.ids.map((id) => String(id).trim()).filter(Boolean);
    }
  } catch {
    ids = undefined;
  }

  try {
    const result = await seedLibraryStories({ ids });
    return NextResponse.json({
      ok: true,
      ...result,
      message:
        result.seeded.length > 0
          ? `Uploaded ${result.seeded.length} ${result.seeded.length === 1 ? "story" : "stories"} to Supabase.`
          : "No stories were uploaded.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "seed_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
