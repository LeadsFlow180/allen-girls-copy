import { LIBRARY_NOVELS, libraryNovelDefinitions, type LibraryWingId } from "@/lib/library/library-catalog";
import { libraryStoryRowToNovel } from "@/lib/library/library-catalog-merge";
import { decodeLibraryStoryContent } from "@/lib/library/library-story-storage";
import type { LibraryStoryRow } from "@/lib/library/library-story-row";

export type TeacherLibraryCatalogItem = {
  id: string;
  title: string;
  author: string;
  wing: LibraryWingId;
  tier: "standard" | "vip";
  synopsis: string;
  ageBand: string;
  coverUrl: string | null;
  inDatabase: boolean;
  isPublished: boolean;
  useChapters: boolean;
  chapterCount: number;
  readMinutes: number;
  updatedAt: string | null;
};

function catalogItemFromRow(row: LibraryStoryRow, readMinutes: number): TeacherLibraryCatalogItem {
  const decoded = decodeLibraryStoryContent(row);
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    wing: row.wing,
    tier: row.tier,
    synopsis: row.synopsis,
    ageBand: row.age_band,
    coverUrl: row.cover_url,
    inDatabase: true,
    isPublished: row.is_published,
    useChapters: decoded.useChapters,
    chapterCount: decoded.useChapters ? decoded.chapters.length : 0,
    readMinutes,
    updatedAt: row.updated_at,
  };
}

export function buildTeacherLibraryCatalog(dbRows: LibraryStoryRow[]): TeacherLibraryCatalogItem[] {
  const dbMap = new Map(dbRows.map((row) => [row.id, row]));
  const definitionMap = new Map(libraryNovelDefinitions().map((def) => [def.id, def]));
  const seen = new Set<string>();
  const items: TeacherLibraryCatalogItem[] = [];

  for (const novel of LIBRARY_NOVELS) {
    seen.add(novel.id);
    const row = dbMap.get(novel.id);
    const def = definitionMap.get(novel.id);

    if (row) {
      const mapped = libraryStoryRowToNovel(row);
      items.push(catalogItemFromRow(row, mapped.readMinutes));
      continue;
    }

    items.push({
      id: novel.id,
      title: novel.title,
      author: novel.author,
      wing: novel.wing,
      tier: novel.tier === "vip" ? "vip" : "standard",
      synopsis: novel.synopsis,
      ageBand: novel.ageBand,
      coverUrl: null,
      inDatabase: false,
      isPublished: true,
      useChapters: true,
      chapterCount: def?.chapters.length ?? 0,
      readMinutes: novel.readMinutes,
      updatedAt: null,
    });
  }

  for (const row of dbRows) {
    if (seen.has(row.id)) continue;
    const mapped = libraryStoryRowToNovel(row);
    items.push(catalogItemFromRow(row, mapped.readMinutes));
  }

  return items.sort((a, b) => a.title.localeCompare(b.title));
}
