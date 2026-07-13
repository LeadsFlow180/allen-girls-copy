import { buildSpreadsFromBody, buildSpreadsFromChapters, estimateReadMinutes } from "./build-spreads";
import { LIBRARY_NOVELS, type LibraryNovel } from "./library-catalog";
import { decodeLibraryStoryContent } from "./library-story-storage";
import type { LibraryStoryRow } from "./library-story-row";

export function libraryStoryRowToNovel(row: LibraryStoryRow): LibraryNovel {
  const decoded = decodeLibraryStoryContent(row);
  const spreads = decoded.useChapters
    ? buildSpreadsFromChapters(decoded.chapters)
    : buildSpreadsFromBody(decoded.body);
  const hasText = spreads.some((spread) => Boolean(spread.left?.trim() || spread.right?.trim()));

  return {
    id: row.id,
    wing: row.wing,
    title: row.title,
    author: row.author,
    synopsis: row.synopsis,
    ageBand: row.age_band,
    readMinutes: hasText ? estimateReadMinutes(spreads) : 10,
    format: row.format,
    spreads,
    pdfPath: row.pdf_url?.trim() || `/library/pdfs/${row.id}.pdf`,
    pdfUrl: row.pdf_url?.trim() || null,
    hasPdfEdition: Boolean(row.pdf_url?.trim()) || row.format === "pdf",
    tier: row.tier === "vip" ? "vip" : undefined,
    coverUrl: row.cover_url,
    useChapters: decoded.useChapters,
  };
}

/** Database rows override static entries with the same id. */
export function mergeLibraryCatalog(dbNovels: LibraryNovel[]): LibraryNovel[] {
  const dbIds = new Set(dbNovels.map((novel) => novel.id));
  const staticOnly = LIBRARY_NOVELS.filter((novel) => !dbIds.has(novel.id));
  return [...dbNovels, ...staticOnly];
}

export function sortLibraryNovels(novels: LibraryNovel[]): LibraryNovel[] {
  return [...novels].sort((a, b) => a.title.localeCompare(b.title));
}
