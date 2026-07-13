import type { LibraryNovel } from "./library-catalog";

export function novelHasPdfEdition(novel: LibraryNovel): boolean {
  if (novel.hasPdfEdition) return true;
  if (novel.format === "pdf") return true;
  if (novel.pdfUrl?.trim()) return true;
  return Boolean(novel.pdfPath?.trim());
}

export function novelHasTextEdition(novel: LibraryNovel): boolean {
  return novel.spreads.some((spread) => Boolean(spread.left?.trim() || spread.right?.trim()));
}
