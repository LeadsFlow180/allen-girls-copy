import { NextResponse } from "next/server";

import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { libraryStoryRowToNovel } from "@/lib/library/library-catalog-merge";
import { normalizeStoryApiRow, updateLibraryStory } from "@/lib/library/library-story-db";
import {
  deleteLibraryAssets,
  libraryStoragePathFromPublicUrl,
} from "@/lib/library/library-storage";
import { parseLibraryStoryPayload } from "@/lib/library/library-story-validation";
import type { LibraryStoryRow } from "@/lib/library/library-story-row";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("library_stories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const row = normalizeStoryApiRow(data as LibraryStoryRow);
  return NextResponse.json({
    story: {
      ...row,
      readMinutes: libraryStoryRowToNovel(row).readMinutes,
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const { id } = await context.params;
  const body = (await request.json()) as unknown;
  const parsed = parseLibraryStoryPayload({ ...(body as object), id });
  if (parsed.ok === false) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await updateLibraryStory(
    auth.supabase,
    id,
    parsed.data,
    new Date().toISOString(),
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ story: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const { id } = await context.params;

  const { data: existing } = await auth.supabase
    .from("library_stories")
    .select("cover_url, pdf_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await auth.supabase.from("library_stories").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (existing) {
    const paths = [
      libraryStoragePathFromPublicUrl(existing.cover_url),
      libraryStoragePathFromPublicUrl(existing.pdf_url),
    ].filter((path): path is string => Boolean(path));
    await deleteLibraryAssets(paths);
  }

  return NextResponse.json({ ok: true });
}
