import type { LibrarySpread } from "./library-catalog";

/** Sized to fit a tall page without inner scrolling. */
const MAX_CHARS = 520;

/** Split chapter prose into page-sized chunks. */
function chunkChapter(chapter: string): string[] {
  const paragraphs = chapter.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > MAX_CHARS && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [chapter];
}

function chunksToSpreads(chunks: string[]): LibrarySpread[] {
  if (chunks.length === 0) return [];

  const spreads: LibrarySpread[] = [{ left: null, right: chunks[0]! }];

  for (let i = 1; i < chunks.length; i += 2) {
    const left = chunks[i]!;
    const right = chunks[i + 1] ?? left;
    spreads.push({
      left: chunks[i + 1] ? left : null,
      right,
    });
  }

  return spreads;
}

/** Turn an array of chapters into left/right reading spreads. */
export function buildSpreadsFromChapters(chapters: string[]): LibrarySpread[] {
  return chapters.flatMap((chapter) => chunksToSpreads(chunkChapter(chapter)));
}

/** Turn continuous story prose into left/right reading spreads (no chapter breaks). */
export function buildSpreadsFromBody(body: string): LibrarySpread[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  return chunksToSpreads(chunkChapter(trimmed));
}

/** Estimate reading time from spread text (~180 wpm for children). */
export function estimateReadMinutes(spreads: LibrarySpread[]): number {
  const words = spreads
    .flatMap((s) => [s.left, s.right])
    .filter(Boolean)
    .join(" ")
    .split(/\s+/).length;
  return Math.max(5, Math.round(words / 180));
}
