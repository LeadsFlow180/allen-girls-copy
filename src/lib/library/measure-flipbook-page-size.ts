import type { PdfPageDimensions } from "@/lib/library/render-pdf-page";

export type FlipbookLayout = "single" | "spread";

const MIN_PAGE_WIDTH = 160;
const MIN_PAGE_HEIGHT = 160;

/**
 * Scale the PDF's native page box to fill the stage.
 * In spread mode each page gets half the width; in single mode it gets the full width.
 */
export function measureFlipbookPageSize(
  containerWidth: number,
  containerHeight: number,
  pageDimensions: PdfPageDimensions | null,
  layout: FlipbookLayout,
): { width: number; height: number } {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const pdfWidth = pageDimensions?.width ?? 612;
  const pdfHeight = pageDimensions?.height ?? 792;

  const availWidth = Math.max(MIN_PAGE_WIDTH, Math.floor(containerWidth));
  const availHeight = Math.max(MIN_PAGE_HEIGHT, Math.floor(containerHeight));
  const maxPageWidth =
    layout === "single" ? availWidth : Math.max(MIN_PAGE_WIDTH, Math.floor(availWidth / 2));

  const scale = Math.min(maxPageWidth / pdfWidth, availHeight / pdfHeight);

  return {
    width: Math.max(MIN_PAGE_WIDTH, Math.floor(pdfWidth * scale)),
    height: Math.max(MIN_PAGE_HEIGHT, Math.floor(pdfHeight * scale)),
  };
}

export function pickFlipbookLayout(_viewportWidth: number): FlipbookLayout {
  // Reason: one full-width page is far more readable than a two-page spread for worksheets.
  return "single";
}
