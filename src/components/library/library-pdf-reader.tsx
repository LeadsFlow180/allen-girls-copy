"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Document, Page } from "react-pdf";

import {
  configurePdfWorker,
  LIBRARY_PDF_DOCUMENT_OPTIONS,
} from "@/lib/library/configure-pdf-worker";
import type { LibraryNovel } from "@/lib/library/library-catalog";

import { LibrarySceneBackground } from "./library-scene-background";
import styles from "./library-pdf-reader.module.css";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type Props = {
  novel: LibraryNovel;
  onClose: () => void;
  onReadOnline?: () => void;
};

export function LibraryPdfReader({ novel, onClose, onReadOnline }: Props) {
  const docRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [workerReady, setWorkerReady] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    configurePdfWorker();
    setWorkerReady(true);
  }, []);

  useEffect(() => {
    const el = docRef.current;
    if (!el) return;

    const measure = () => {
      const next = Math.floor(el.clientWidth - 8);
      if (next > 0) setPageWidth(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const isFirst = page <= 1;
  const isLast = totalPages > 0 && page >= totalPages;
  const progress = totalPages > 0 ? (page / totalPages) * 100 : 0;

  const goNext = useCallback(() => {
    setPage((p) => (totalPages > 0 ? Math.min(p + 1, totalPages) : p + 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  return (
    <div className={styles.reader}>
      <LibrarySceneBackground dim="medium" />
      <header className={styles.header}>
        <button type="button" className={styles.exit} onClick={onClose}>
          <ArrowLeft size={16} aria-hidden />
          Back to Library
        </button>

        <div className={styles.headerCenter}>
          <h1 className={styles.title}>{novel.title}</h1>
          <p className={styles.meta}>
            {novel.author} · PDF edition
          </p>
        </div>

        <a
          className={styles.download}
          href={novel.pdfPath}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download size={15} aria-hidden />
          Download
        </a>
      </header>

      <main className={styles.main}>
        <button
          type="button"
          className={styles.navCircle}
          aria-label="Previous page"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ChevronLeft size={20} aria-hidden />
        </button>

        <div ref={docRef} className={styles.docWrap}>
          {!workerReady || pageWidth <= 0 ? (
            <p className={styles.loading}>Opening book…</p>
          ) : loadError ? (
            <div className={styles.error}>
              <p>{loadError}</p>
              {onReadOnline ? (
                <button type="button" className={styles.readOnline} onClick={onReadOnline}>
                  Read online
                </button>
              ) : null}
              <a className={styles.downloadInline} href={novel.pdfPath} download>
                Download PDF
              </a>
            </div>
          ) : (
            <Document
              key={novel.pdfPath}
              file={novel.pdfPath}
              options={LIBRARY_PDF_DOCUMENT_OPTIONS}
              onLoadSuccess={({ numPages }) => {
                setLoadError(null);
                setTotalPages(numPages);
              }}
              onLoadError={(err) => {
                console.error("Library PDF load failed:", novel.pdfPath, err);
                setLoadError("Could not load PDF. Try reading online instead.");
              }}
              loading={<p className={styles.loading}>Opening book…</p>}
              error={
                <div className={styles.error}>
                  <p>Could not load PDF. Try reading online instead.</p>
                  {onReadOnline ? (
                    <button type="button" className={styles.readOnline} onClick={onReadOnline}>
                      Read online
                    </button>
                  ) : null}
                  <a className={styles.downloadInline} href={novel.pdfPath} download>
                    Download PDF
                  </a>
                </div>
              }
            >
              <Page
                key={`${novel.pdfPath}-${page}`}
                pageNumber={page}
                width={pageWidth}
                className={styles.page}
                renderTextLayer
                renderAnnotationLayer
                loading={<p className={styles.loading}>Rendering page…</p>}
                onRenderError={(err) => {
                  console.error("Library PDF page render failed:", err);
                  setLoadError("Could not render this page. Try reading online instead.");
                }}
              />
            </Document>
          )}
        </div>

        <button
          type="button"
          className={styles.navCircle}
          aria-label="Next page"
          onClick={goNext}
          disabled={isLast}
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </main>

      <footer className={styles.footer}>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>
            Page {page}
            {totalPages > 0 ? ` of ${totalPages}` : ""}
          </span>
        </div>

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={goPrev}
            disabled={isFirst}
          >
            Previous
          </button>
          {isLast ? (
            <button type="button" className={styles.btnPrimary} onClick={onClose}>
              Finish Reading
            </button>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={goNext}>
              Next Page
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
