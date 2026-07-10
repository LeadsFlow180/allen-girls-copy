import type { SupabaseClient } from "@supabase/supabase-js";

import type { LibraryStoryPayload } from "./library-story-validation";
import {
  buildLibraryStoryDbWrite,
  isMissingStoryColumnError,
  normalizeLibraryStoryRow,
} from "./library-story-storage";
import type { LibraryStoryRow } from "./library-story-row";

type WriteExtras = {
  cover_url?: string | null;
  pdf_url?: string | null;
  created_by?: string;
  updated_at: string;
};

export async function insertLibraryStory(
  supabase: SupabaseClient,
  parsed: LibraryStoryPayload,
  extras: WriteExtras,
) {
  const fullRow = {
    id: parsed.id,
    ...buildLibraryStoryDbWrite(parsed, "full"),
    cover_url: extras.cover_url ?? null,
    pdf_url: extras.pdf_url ?? null,
    created_by: extras.created_by ?? null,
    updated_at: extras.updated_at,
  };

  let result = await supabase.from("library_stories").insert(fullRow).select("*").single();

  if (result.error && isMissingStoryColumnError(result.error.message)) {
    const legacyRow = {
      id: parsed.id,
      ...buildLibraryStoryDbWrite(parsed, "legacy"),
      cover_url: extras.cover_url ?? null,
      pdf_url: extras.pdf_url ?? null,
      created_by: extras.created_by ?? null,
      updated_at: extras.updated_at,
    };
    result = await supabase.from("library_stories").insert(legacyRow).select("*").single();
  }

  if (result.error) return result;

  return {
    ...result,
    data: normalizeLibraryStoryRow(result.data as LibraryStoryRow) as LibraryStoryRow,
  };
}

export async function updateLibraryStory(
  supabase: SupabaseClient,
  id: string,
  parsed: LibraryStoryPayload,
  updatedAt: string,
) {
  const fullRow = {
    ...buildLibraryStoryDbWrite(parsed, "full"),
    updated_at: updatedAt,
  };

  let result = await supabase
    .from("library_stories")
    .update(fullRow)
    .eq("id", id)
    .select("*")
    .single();

  if (result.error && isMissingStoryColumnError(result.error.message)) {
    const legacyRow = {
      ...buildLibraryStoryDbWrite(parsed, "legacy"),
      updated_at: updatedAt,
    };
    result = await supabase
      .from("library_stories")
      .update(legacyRow)
      .eq("id", id)
      .select("*")
      .single();
  }

  if (result.error) return result;

  return {
    ...result,
    data: normalizeLibraryStoryRow(result.data as LibraryStoryRow) as LibraryStoryRow,
  };
}

export function normalizeStoryApiRow(row: LibraryStoryRow): LibraryStoryRow {
  return normalizeLibraryStoryRow(row) as LibraryStoryRow;
}
