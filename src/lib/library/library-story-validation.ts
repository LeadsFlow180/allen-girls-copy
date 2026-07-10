import type { LibraryFormat, LibraryTier, LibraryWingId } from "./library-catalog";

const STORY_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeStoryId(raw: string): string | null {
  const id = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!id || !STORY_ID_RE.test(id) || id.length > 80) return null;
  return id;
}

export function slugifyStoryIdFromTitle(title: string): string | null {
  return normalizeStoryId(title);
}

export function parseChaptersJson(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const chapters = raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return chapters.length > 0 ? chapters : null;
}

export type LibraryStoryPayload = {
  id: string;
  wing: LibraryWingId;
  title: string;
  author: string;
  synopsis: string;
  ageBand: string;
  format: LibraryFormat;
  tier: LibraryTier;
  useChapters: boolean;
  chapters: string[];
  body: string;
  isPublished: boolean;
  sortOrder: number;
};

function parseExplicitUseChapters(record: Record<string, unknown>): boolean | null {
  const raw = record.useChapters ?? record.use_chapters;
  if (raw === false || raw === 0 || raw === "false" || raw === "0") return false;
  if (raw === true || raw === 1 || raw === "true" || raw === "1") return true;
  return null;
}

function parseStoryBody(record: Record<string, unknown>): string {
  return String(record.body ?? record.storyBody ?? record.story_body ?? "").trim();
}

function parseChaptersArray(record: Record<string, unknown>): string[] {
  if (!Array.isArray(record.chapters)) return [];
  return record.chapters
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function parseLibraryStoryPayload(body: unknown): { ok: true; data: LibraryStoryPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const record = body as Record<string, unknown>;
  const id = normalizeStoryId(String(record.id ?? ""));
  if (!id) return { ok: false, error: "invalid_id" };

  const wing = record.wing;
  if (wing !== "allen_girls" && wing !== "licensed") {
    return { ok: false, error: "invalid_wing" };
  }

  const title = String(record.title ?? "").trim();
  if (!title) return { ok: false, error: "title_required" };

  const storyBody = parseStoryBody(record);
  const chapterList = parseChaptersArray(record);
  const explicitUseChapters = parseExplicitUseChapters(record);

  // Reason: older clients may omit useChapters; infer single-story mode when only body is provided.
  let useChapters =
    explicitUseChapters ??
    (storyBody && chapterList.length === 0 ? false : true);

  let chapters: string[] = [];
  let normalizedBody = "";

  if (useChapters) {
    if (chapterList.length === 0) {
      if (storyBody) {
        useChapters = false;
        normalizedBody = storyBody;
      } else {
        return { ok: false, error: "chapters_required" };
      }
    } else {
      chapters = chapterList;
    }
  }

  if (!useChapters) {
    normalizedBody = storyBody;
    if (!normalizedBody) return { ok: false, error: "body_required" };
  }

  const format = record.format === "pdf" ? "pdf" : "text";
  const tier: LibraryTier = record.tier === "vip" ? "vip" : "standard";

  return {
    ok: true,
    data: {
      id,
      wing,
      title,
      author: String(record.author ?? "Allen Girls Adventures").trim() || "Allen Girls Adventures",
      synopsis: String(record.synopsis ?? "").trim(),
      ageBand: String(record.ageBand ?? record.age_band ?? "Ages 8–11").trim() || "Ages 8–11",
      format,
      tier,
      useChapters,
      chapters,
      body: normalizedBody,
      isPublished: record.isPublished !== false && record.is_published !== false,
      sortOrder: Number.isFinite(Number(record.sortOrder ?? record.sort_order))
        ? Number(record.sortOrder ?? record.sort_order)
        : 0,
    },
  };
}
