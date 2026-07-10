import type { LibraryFormat, LibraryTier, LibraryWingId } from "./library-catalog";

export const LIBRARY_STORAGE_BUCKET = "library-assets";

export type LibraryStoryRow = {
  id: string;
  wing: LibraryWingId;
  title: string;
  author: string;
  synopsis: string;
  age_band: string;
  format: LibraryFormat;
  tier: LibraryTier;
  use_chapters?: boolean;
  chapters: string[];
  body?: string;
  cover_url: string | null;
  pdf_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type LibraryStoryListItem = Pick<
  LibraryStoryRow,
  | "id"
  | "wing"
  | "title"
  | "author"
  | "synopsis"
  | "age_band"
  | "format"
  | "tier"
  | "cover_url"
  | "pdf_url"
  | "is_published"
  | "sort_order"
  | "updated_at"
>;
