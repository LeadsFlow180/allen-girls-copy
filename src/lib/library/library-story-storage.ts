import type { LibraryStoryPayload } from "./library-story-validation";

/** Encodes single-story prose in `chapters` when migration 019 columns are missing. */
export const SINGLE_STORY_MARKER = "# AGA_SINGLE_STORY";

export type DecodedLibraryStoryContent = {
  useChapters: boolean;
  chapters: string[];
  body: string;
};

function parseChaptersArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function decodeLibraryStoryContent(row: {
  use_chapters?: boolean | null;
  body?: string | null;
  chapters?: unknown;
}): DecodedLibraryStoryContent {
  const chapters = parseChaptersArray(row.chapters);

  if (row.use_chapters === false) {
    return {
      useChapters: false,
      chapters: [],
      body: String(row.body ?? "").trim(),
    };
  }

  if (row.use_chapters === true) {
    return {
      useChapters: true,
      chapters,
      body: "",
    };
  }

  // Reason: pre-migration rows store single-story prose in chapters[0] with a marker prefix.
  if (chapters.length === 1 && chapters[0]!.startsWith(SINGLE_STORY_MARKER)) {
    const body = chapters[0]!
      .slice(SINGLE_STORY_MARKER.length)
      .trim()
      .replace(/^\n+/, "");
    return { useChapters: false, chapters: [], body };
  }

  return { useChapters: true, chapters, body: "" };
}

export function encodeSingleStoryForLegacyDb(body: string): string[] {
  return [`${SINGLE_STORY_MARKER}\n\n${body.trim()}`];
}

export function isMissingStoryColumnError(message: string): boolean {
  return (
    /could not find the '(body|use_chapters)' column/i.test(message) ||
    /column "(body|use_chapters)" of relation "library_stories" does not exist/i.test(message)
  );
}

type StoryDbCore = {
  wing: LibraryStoryPayload["wing"];
  title: string;
  author: string;
  synopsis: string;
  age_band: string;
  format: LibraryStoryPayload["format"];
  tier: LibraryStoryPayload["tier"];
  chapters: string[];
  is_published: boolean;
  sort_order: number;
};

export function buildLibraryStoryDbCore(parsed: LibraryStoryPayload): StoryDbCore {
  return {
    wing: parsed.wing,
    title: parsed.title,
    author: parsed.author,
    synopsis: parsed.synopsis,
    age_band: parsed.ageBand,
    format: parsed.format,
    tier: parsed.tier,
    chapters: parsed.useChapters ? parsed.chapters : [],
    is_published: parsed.isPublished,
    sort_order: parsed.sortOrder,
  };
}

export function buildLibraryStoryDbWrite(
  parsed: LibraryStoryPayload,
  mode: "full" | "legacy",
): StoryDbCore & { use_chapters?: boolean; body?: string } {
  const core = buildLibraryStoryDbCore(parsed);

  if (mode === "legacy") {
    return {
      ...core,
      chapters: parsed.useChapters ? parsed.chapters : encodeSingleStoryForLegacyDb(parsed.body),
    };
  }

  return {
    ...core,
    use_chapters: parsed.useChapters,
    chapters: parsed.useChapters ? parsed.chapters : [],
    body: parsed.useChapters ? "" : parsed.body,
  };
}

export function normalizeLibraryStoryRow<T extends Record<string, unknown>>(row: T) {
  const decoded = decodeLibraryStoryContent(row as Parameters<typeof decodeLibraryStoryContent>[0]);
  return {
    ...row,
    use_chapters: decoded.useChapters,
    chapters: decoded.useChapters ? decoded.chapters : [],
    body: decoded.body,
  };
}
