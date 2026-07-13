import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { pdfjs } from "react-pdf";

import {
  configurePdfWorker,
  LIBRARY_PDF_DOCUMENT_OPTIONS,
} from "@/lib/library/configure-pdf-worker";
import { cropCanvasToContent } from "@/lib/library/crop-canvas-content";

export type PdfPageDimensions = {
  width: number;
  height: number;
  aspect: number;
};

const DIMENSION_PROBE_SCALE = 1.25;

export async function loadLibraryPdfDocument(url: string): Promise<PDFDocumentProxy> {
  configurePdfWorker();
  const task = pdfjs.getDocument({
    url,
    ...LIBRARY_PDF_DOCUMENT_OPTIONS,
  });
  return task.promise;
}

export function getPdfPageDimensions(page: PDFPageProxy): PdfPageDimensions {
  const viewport = page.getViewport({ scale: 1 });
  return {
    width: viewport.width,
    height: viewport.height,
    aspect: viewport.width / viewport.height,
  };
}

async function measureCroppedPageDimensions(page: PDFPageProxy): Promise<PdfPageDimensions> {
  const baseViewport = page.getViewport({ scale: 1 });
  const renderViewport = page.getViewport({ scale: DIMENSION_PROBE_SCALE });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(renderViewport.width);
  canvas.height = Math.round(renderViewport.height);

  const context = canvas.getContext("2d");
  if (!context) return getPdfPageDimensions(page);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport: renderViewport,
    canvas,
  }).promise;

  const cropped = cropCanvasToContent(canvas);
  const scaleBack = 1 / DIMENSION_PROBE_SCALE;

  return {
    width: cropped.width * scaleBack,
    height: cropped.height * scaleBack,
    aspect: cropped.width / cropped.height,
  };
}

export async function readPdfPageDimensions(doc: PDFDocumentProxy): Promise<PdfPageDimensions> {
  const page = await doc.getPage(1);
  return measureCroppedPageDimensions(page);
}

export async function renderPdfPageToDataUrl(
  page: PDFPageProxy,
  targetWidth: number,
  targetHeight: number,
): Promise<string> {
  const baseViewport = page.getViewport({ scale: 1 });
  const dpr =
    typeof window !== "undefined" ? Math.min(Math.max(window.devicePixelRatio || 1, 2), 3) : 2;

  const pixelWidth = Math.max(1, Math.round(targetWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(targetHeight * dpr));

  const renderScale = Math.max(pixelWidth / baseViewport.width, pixelHeight / baseViewport.height);
  const renderViewport = page.getViewport({ scale: renderScale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(renderViewport.width);
  canvas.height = Math.round(renderViewport.height);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas_unavailable");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport: renderViewport,
    canvas,
  }).promise;

  const cropped = cropCanvasToContent(canvas);

  const output = document.createElement("canvas");
  output.width = pixelWidth;
  output.height = pixelHeight;

  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("canvas_unavailable");

  outputContext.fillStyle = "#ffffff";
  outputContext.fillRect(0, 0, pixelWidth, pixelHeight);
  outputContext.drawImage(cropped, 0, 0, pixelWidth, pixelHeight);

  return output.toDataURL("image/png");
}
