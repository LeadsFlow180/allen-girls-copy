import { pdfjs } from "react-pdf";

let configured = false;

/** Point pdf.js at a stable worker URL (Turbopack breaks import.meta.url workers). */
export function configurePdfWorker() {
  if (configured || typeof window === "undefined") return;
  pdfjs.GlobalWorkerOptions.workerSrc = `/library/pdf.worker.min.mjs`;
  configured = true;
}

/** Stable options for pdf.js Document — standard fonts required for pdf-lib output in v5+. */
export const LIBRARY_PDF_DOCUMENT_OPTIONS = {
  standardFontDataUrl: "/library/standard_fonts/",
  cMapUrl: "/library/cmaps/",
  cMapPacked: true,
} as const;

/** @deprecated Use LIBRARY_PDF_DOCUMENT_OPTIONS */
export function libraryPdfDocumentOptions() {
  return LIBRARY_PDF_DOCUMENT_OPTIONS;
}