"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, Volume2 } from "lucide-react";

import { useLibraryReadAloud } from "@/hooks/use-library-read-aloud";
import { buildAloudSpread, type AloudPage } from "@/lib/library/library-read-aloud";
import type { LibraryNovel } from "@/lib/library/library-catalog";

import { LibraryCurtainScroll } from "./library-curtain-scroll";
import { LibraryHighlightedText } from "./library-highlighted-text";
import { LibrarySceneBackground } from "./library-scene-background";
import styles from "./library-page-reader.module.css";

type Props = {
  novel: LibraryNovel;
  onClose: () => void;
};

function hintMessage(progress: number, isLast: boolean): string {
  if (isLast) return "You finished the whole story!";
  if (progress < 25) return "Tap the arrow when you're ready for more";
  if (progress < 75) return "You're doing great — keep going";
  return "Almost at the end!";
}

function PageContent({
  page,
  pageNumber,
  sheetRef,
  activeWordIndex,
  tracingPaused = false,
}: {
  page: AloudPage;
  pageNumber: number;
  sheetRef?: (el: HTMLDivElement | null) => void;
  activeWordIndex: number | null;
  tracingPaused?: boolean;
}) {
  return (
    <div className={styles.pageSheet}>
      <LibraryCurtainScroll sheetRef={sheetRef}>
        <div className={styles.pageBody}>
          <LibraryHighlightedText
            chapter={page.chapter}
            paragraphs={page.paragraphs}
            words={page.words}
            activeWordIndex={activeWordIndex}
            tracingPaused={tracingPaused}
            paragraphLead={Boolean(page.chapter)}
          />
        </div>
      </LibraryCurtainScroll>
      <p className={styles.pageNumber} aria-hidden>
        {pageNumber}
      </p>
    </div>
  );
}

export function LibraryPageReader({ novel, onClose }: Props) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [continuousRead, setContinuousRead] = useState(false);
  const pageSheetRefs = useRef<(HTMLDivElement | null)[]>([]);

  const total = novel.spreads.length;
  const spread = novel.spreads[spreadIndex];
  const progress = ((spreadIndex + 1) / total) * 100;
  const isFirst = spreadIndex === 0;
  const isLast = spreadIndex >= total - 1;
  const hasLeft = Boolean(spread.left);
  const hint = useMemo(() => hintMessage(progress, isLast), [progress, isLast]);
  const useChapters = novel.useChapters !== false;

  const aloudSpread = useMemo(
    () => buildAloudSpread(spread, useChapters),
    [spread, useChapters],
  );

  const leftPage = aloudSpread.pages.find((page) => page.side === "left");
  const rightPage = aloudSpread.pages.find((page) => page.side === "right");

  const requestNextSpread = useCallback(() => {
    setSpreadIndex((index) => Math.min(index + 1, total - 1));
  }, [total]);

  const { status, activeWordIndex, toggle, stop, speakCurrentSpread, supported } =
    useLibraryReadAloud({
      spreadIndex,
      spread,
      useChapters,
      continuousRead,
      isLastSpread: isLast,
      onRequestNextSpread: requestNextSpread,
      onStoryFinished: () => setContinuousRead(false),
    });

  const endContinuousRead = useCallback(() => {
    setContinuousRead(false);
    stop();
  }, [stop]);

  const goNext = useCallback(() => {
    if (spreadIndex >= total - 1) return;
    endContinuousRead();
    setSpreadIndex((i) => i + 1);
  }, [endContinuousRead, spreadIndex, total]);

  const goPrev = useCallback(() => {
    if (spreadIndex <= 0) return;
    endContinuousRead();
    setSpreadIndex((i) => i - 1);
  }, [endContinuousRead, spreadIndex]);

  const handleReadAloudToggle = useCallback(() => {
    if (status === "idle") {
      setContinuousRead(true);
      speakCurrentSpread();
      return;
    }
    toggle();
  }, [speakCurrentSpread, status, toggle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    pageSheetRefs.current.forEach((el) => {
      el?.scrollTo({ top: 0 });
    });
  }, [spreadIndex]);

  useEffect(() => {
    return () => endContinuousRead();
  }, [endContinuousRead]);

  const readAloudLabel =
    status === "playing"
      ? "Pause"
      : status === "paused"
        ? "Resume"
        : status === "turning"
          ? "Turning page…"
          : "Read to me";

  const ReadAloudIcon =
    status === "playing" ? Pause : status === "paused" ? Play : Volume2;

  const readAloudStatus =
    status === "turning"
      ? "Next page…"
      : status === "playing"
        ? "Following each word"
        : status === "paused"
          ? "Paused"
          : null;

  return (
    <div className={styles.reader}>
      <LibrarySceneBackground dim="medium" />

      <header className={styles.hud}>
        <button type="button" className={styles.hudBack} onClick={onClose}>
          <ArrowLeft size={17} aria-hidden />
          Library
        </button>

        <div className={styles.hudMeta}>
          <h1 className={styles.hudTitle}>{novel.title}</h1>
          <p className={styles.hudSub}>{novel.ageBand}</p>
        </div>

        <p className={styles.hudPage} aria-live="polite">
          {spreadIndex + 1} / {total}
        </p>
      </header>

      <main className={styles.stage}>
        <article
          key={spreadIndex}
          className={`${styles.book}${hasLeft ? ` ${styles.bookOpen}` : ""}`}
        >
          <div
            className={`${styles.pageGrid}${hasLeft ? "" : ` ${styles.pageGridSingle}`}`}
          >
            {leftPage ? (
              <section className={`${styles.page} ${styles.pageLeft}`}>
                <PageContent
                  page={leftPage}
                  pageNumber={spreadIndex * 2 + 1}
                  activeWordIndex={activeWordIndex}
                  tracingPaused={status === "paused"}
                  sheetRef={(el) => {
                    pageSheetRefs.current[0] = el;
                  }}
                />
              </section>
            ) : null}
            {hasLeft ? <div className={styles.spine} aria-hidden /> : null}
            {rightPage ? (
              <section className={`${styles.page} ${styles.pageRight}`}>
                <PageContent
                  page={rightPage}
                  pageNumber={hasLeft ? spreadIndex * 2 + 2 : spreadIndex + 1}
                  activeWordIndex={activeWordIndex}
                  tracingPaused={status === "paused"}
                  sheetRef={(el) => {
                    pageSheetRefs.current[hasLeft ? 1 : 0] = el;
                  }}
                />
              </section>
            ) : null}
          </div>
        </article>
      </main>

      <footer className={styles.footer}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.readAloudRow}>
          <button
            type="button"
            className={`${styles.readAloudBtn}${status === "playing" || status === "turning" ? ` ${styles.readAloudBtnActive}` : ""}`}
            onClick={handleReadAloudToggle}
            disabled={
              !supported || !aloudSpread.speakText.trim() || status === "turning"
            }
            aria-pressed={status === "playing" || status === "paused" || status === "turning"}
            aria-label={supported ? readAloudLabel : "Read aloud is not supported in this browser"}
          >
            <ReadAloudIcon size={16} aria-hidden />
            {readAloudLabel}
          </button>
          {readAloudStatus ? (
            <span className={styles.readAloudStatus} aria-live="polite">
              {readAloudStatus}
            </span>
          ) : null}
        </div>

        <div className={styles.footerRow}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Previous page"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>

          <div className={styles.footerCenter}>
            <p className={styles.hint}>{hint}</p>
          </div>

          {isLast ? (
            <button type="button" className={styles.navBtnDone} onClick={onClose}>
              Done!
            </button>
          ) : (
            <button
              type="button"
              className={styles.navBtnNext}
              onClick={goNext}
              aria-label="Next page"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
