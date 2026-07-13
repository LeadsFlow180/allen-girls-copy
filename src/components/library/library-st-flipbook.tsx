"use client";

import { forwardRef, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";

import styles from "./library-flipbook-reader.module.css";
import type { FlipbookLayout } from "@/lib/library/measure-flipbook-page-size";

type PdfPageProps = {
  pageNumber: number;
  src: string | null;
};

const PdfFlipPage = forwardRef<HTMLDivElement, PdfPageProps>(function PdfFlipPage(
  { pageNumber, src },
  ref,
) {
  return (
    <div ref={ref} className={styles.stPage} data-density="soft">
      <div className={styles.stPageInner}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Page ${pageNumber}`}
            className={styles.stPageImage}
            draggable={false}
          />
        ) : (
          <div className={styles.pageLoading}>
            <span className={styles.pageLoadingShimmer} aria-hidden />
            <p>Loading page {pageNumber}…</p>
          </div>
        )}
      </div>
    </div>
  );
});

export type LibraryStFlipbookHandle = {
  pageFlip: () => {
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
    getCurrentPageIndex: () => number;
    getState: () => string;
  };
};

type Props = {
  totalPages: number;
  pageWidth: number;
  pageHeight: number;
  layout: FlipbookLayout;
  getPageSrc: (pageNumber: number) => string | null;
  onFlip: (pageIndex: number) => void;
  onFlipStart?: () => void;
  bookRef: React.RefObject<LibraryStFlipbookHandle | null>;
};

export function LibraryStFlipbook({
  totalPages,
  pageWidth,
  pageHeight,
  layout,
  getPageSrc,
  onFlip,
  onFlipStart,
  bookRef,
}: Props) {
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  if (pageWidth <= 0 || pageHeight <= 0 || totalPages <= 0) return null;

  return (
    <HTMLFlipBook
      ref={bookRef}
      className={styles.stFlipbook}
      style={{}}
      width={pageWidth}
      height={pageHeight}
      size="fixed"
      minWidth={pageWidth}
      maxWidth={pageWidth}
      minHeight={pageHeight}
      maxHeight={pageHeight}
      drawShadow
      flippingTime={920}
      usePortrait={layout === "single"}
      startZIndex={0}
      autoSize={false}
      maxShadowOpacity={0.62}
      showCover={false}
      mobileScrollSupport
      clickEventForward
      useMouseEvents
      swipeDistance={30}
      showPageCorners
      disableFlipByClick={false}
      startPage={0}
      onFlip={(event: { data: number }) => onFlip(event.data)}
      onChangeState={(event: { data: string }) => {
        if (event.data === "flipping") onFlipStart?.();
      }}
    >
      {pages.map((pageNumber) => (
        <PdfFlipPage
          key={pageNumber}
          pageNumber={pageNumber}
          src={getPageSrc(pageNumber)}
        />
      ))}
    </HTMLFlipBook>
  );
}
