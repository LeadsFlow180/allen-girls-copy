import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  libraryStoryRowToNovel,
  mergeLibraryCatalog,
  sortLibraryNovels,
} from "@/lib/library/library-catalog-merge";
import { LIBRARY_NOVELS } from "@/lib/library/library-catalog";
import type { LibraryStoryRow } from "@/lib/library/library-story-row";
import { normalizeLibraryStoryRow } from "@/lib/library/library-story-storage";

export async function fetchPublishedLibraryNovels() {
  if (!isSupabaseConfigured()) {
    return sortLibraryNovels(LIBRARY_NOVELS);
  }

  const admin = createServiceRoleSupabaseClient();
  if (!admin) {
    return sortLibraryNovels(LIBRARY_NOVELS);
  }

  const { data, error } = await admin
    .from("library_stories")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) {
    return sortLibraryNovels(LIBRARY_NOVELS);
  }

  const dbNovels = (data as LibraryStoryRow[])
    .map((row) => normalizeLibraryStoryRow(row) as LibraryStoryRow)
    .map(libraryStoryRowToNovel);
  return sortLibraryNovels(mergeLibraryCatalog(dbNovels));
}

export async function fetchTeacherLibraryRows() {
  const admin = createServiceRoleSupabaseClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("library_stories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data) return [];
  return (data as LibraryStoryRow[]).map(
    (row) => normalizeLibraryStoryRow(row) as LibraryStoryRow,
  );
}
