"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  loadLibraryPdfDocument,
  readPdfPageDimensions,
  renderPdfPageToDataUrl,
  type PdfPageDimensions,
} from "@/lib/library/render-pdf-page";

type PageCache = Map<number, string>;

type State = {
  totalPages: number;
  pageDimensions: PdfPageDimensions | null;
  loading: boolean;
  error: string | null;
};

export function useLibraryPdfPages(
  pdfUrl: string,
  pageWidth: number,
  pageHeight: number,
) {
  const docRef = useRef<Awaited<ReturnType<typeof loadLibraryPdfDocument>> | null>(null);
  const cacheRef = useRef<PageCache>(new Map());
  const renderQueueRef = useRef<Set<number>>(new Set());
  const renderSizeRef = useRef({ width: 0, height: 0 });
  const [state, setState] = useState<State>({
    totalPages: 0,
    pageDimensions: null,
    loading: true,
    error: null,
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    cacheRef.current.clear();
    renderQueueRef.current.clear();
    docRef.current = null;

    setState({
      totalPages: 0,
      pageDimensions: null,
      loading: true,
      error: null,
    });
    setVersion((v) => v + 1);

    void (async () => {
      try {
        const doc = await loadLibraryPdfDocument(pdfUrl);
        if (cancelled) return;
        const pageDimensions = await readPdfPageDimensions(doc);
        docRef.current = doc;
        setState({
          totalPages: doc.numPages,
          pageDimensions,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Library PDF load failed:", pdfUrl, err);
        if (!cancelled) {
          setState({
            totalPages: 0,
            pageDimensions: null,
            loading: false,
            error: "Could not open this book. Try again or read the online edition.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      void docRef.current?.destroy();
      docRef.current = null;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pageWidth <= 0 || pageHeight <= 0) return;
    const prev = renderSizeRef.current;
    if (prev.width === pageWidth && prev.height === pageHeight) return;
    renderSizeRef.current = { width: pageWidth, height: pageHeight };
    cacheRef.current.clear();
    setVersion((v) => v + 1);
  }, [pageWidth, pageHeight]);

  const getPageSrc = useCallback(
    (pageNumber: number | null) => {
      if (!pageNumber) return null;
      return cacheRef.current.get(pageNumber) ?? null;
    },
    [version],
  );

  const ensurePage = useCallback(
    async (pageNumber: number | null) => {
      if (!pageNumber || pageWidth <= 0 || pageHeight <= 0) return;
      if (cacheRef.current.has(pageNumber)) return;
      if (renderQueueRef.current.has(pageNumber)) return;

      const doc = docRef.current;
      if (!doc) return;

      renderQueueRef.current.add(pageNumber);
      try {
        const page = await doc.getPage(pageNumber);
        const dataUrl = await renderPdfPageToDataUrl(page, pageWidth, pageHeight);
        cacheRef.current.set(pageNumber, dataUrl);
        setVersion((v) => v + 1);
      } catch (err) {
        console.error("Library PDF page render failed:", pageNumber, err);
      } finally {
        renderQueueRef.current.delete(pageNumber);
      }
    },
    [pageWidth, pageHeight],
  );

  const prefetchAround = useCallback(
    (centerPage: number) => {
      if (centerPage < 1 || state.totalPages <= 0) return;
      const start = Math.max(1, centerPage - 1);
      const end = Math.min(state.totalPages, centerPage + 4);
      for (let page = start; page <= end; page += 1) {
        void ensurePage(page);
      }
    },
    [ensurePage, state.totalPages],
  );

  return {
    ...state,
    getPageSrc,
    prefetchAround,
  };
}
