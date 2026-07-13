"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

import { useLibraryPdfPages } from "@/hooks/use-library-pdf-pages";
import {
  measureFlipbookPageSize,
  pickFlipbookLayout,
  type FlipbookLayout,
} from "@/lib/library/measure-flipbook-page-size";
import type { LibraryNovel } from "@/lib/library/library-catalog";
import {
  isPageTurnSoundEnabled,
  playPageTurnSound,
  setPageTurnSoundEnabled,
  warmUpPageTurnAudio,
} from "@/lib/sound/page-turn-sound";

import {
  LibraryStFlipbook,
  type LibraryStFlipbookHandle,
} from "./library-st-flipbook";
import { LibrarySceneBackground } from "./library-scene-background";
import styles from "./library-flipbook-reader.module.css";

type Props = {
  novel: LibraryNovel;
  onClose: () => void;
  onReadOnline?: () => void;
};

export function LibraryFlipbookReader({ novel, onClose, onReadOnline }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<LibraryStFlipbookHandle | null>(null);
  const lastFlipSoundAtRef = useRef(0);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [layout, setLayout] = useState<FlipbookLayout>("spread");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { totalPages, pageDimensions, loading, error, getPageSrc, prefetchAround } =
    useLibraryPdfPages(novel.pdfPath, pageSize.width, pageSize.height);

  const currentPage = Math.min(totalPages, Math.max(1, pageIndex + 1));
  const isFirst = pageIndex <= 0;
  const isLast = totalPages > 0 && pageIndex >= totalPages - 1;
  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  useEffect(() => {
    setSoundEnabled(isPageTurnSoundEnabled());
  }, []);

  useEffect(() => {
    const warm = () => warmUpPageTurnAudio();
    window.addEventListener("pointerdown", warm, { once: true });
    return () => window.removeEventListener("pointerdown", warm);
  }, []);

  useEffect(() => {
    const updateLayout = () => setLayout(pickFlipbookLayout(window.innerWidth));
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const measure = () => {
      const nextLayout = pickFlipbookLayout(window.innerWidth);
      const next = measureFlipbookPageSize(
        el.clientWidth,
        el.clientHeight,
        pageDimensions,
        nextLayout,
      );
      setLayout(nextLayout);
      setPageSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pageDimensions]);

  useEffect(() => {
    if (totalPages > 0 && pageSize.width > 0 && pageSize.height > 0) {
      prefetchAround(1);
    }
  }, [totalPages, pageSize.width, pageSize.height, prefetchAround]);

  const playFlipSound = useCallback(() => {
    const now = Date.now();
    if (now - lastFlipSoundAtRef.current < 350) return;
    lastFlipSoundAtRef.current = now;
    warmUpPageTurnAudio();
    playPageTurnSound();
  }, []);

  const handleFlip = useCallback(
    (index: number) => {
      setPageIndex(index);
      prefetchAround(index + 1);
    },
    [prefetchAround],
  );

  const handleFlipStart = useCallback(() => {
    playFlipSound();
  }, [playFlipSound]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || loading || totalPages <= 0) return;

    const warm = () => warmUpPageTurnAudio();
    el.addEventListener("pointerdown", warm);
    return () => el.removeEventListener("pointerdown", warm);
  }, [loading, totalPages]);

  useEffect(() => {
    if (loading || totalPages <= 0) return;

    const onPointerUp = () => {
      const state = bookRef.current?.pageFlip().getState();
      // Reason: drag-to-flip keeps `user_fold` during the turn; only arrow/swipe use `flipping`.
      if (state === "user_fold") {
        playFlipSound();
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [loading, totalPages, playFlipSound]);

  const toggleSound = useCallback(() => {
    warmUpPageTurnAudio();
    const next = !soundEnabled;
    setPageTurnSoundEnabled(next);
    setSoundEnabled(next);
    if (next) playFlipSound();
  }, [soundEnabled, playFlipSound]);

  const goNext = useCallback(() => {
    warmUpPageTurnAudio();
    bookRef.current?.pageFlip().flipNext("bottom");
  }, []);

  const goPrev = useCallback(() => {
    warmUpPageTurnAudio();
    bookRef.current?.pageFlip().flipPrev("bottom");
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

  const hint = isLast
    ? "You reached the last page!"
    : pageIndex === 0
      ? "Drag a page corner or tap the arrow to turn"
      : "Keep flipping — just like a real book";

  const bookKey = `${layout}-${pageSize.width}x${pageSize.height}-${totalPages}`;

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
          <p className={styles.hudSub}>{novel.author} · Flip book</p>
        </div>

        <p className={styles.hudPage} aria-live="polite">
          {totalPages > 0 ? `${currentPage} / ${totalPages}` : "…"}
        </p>
      </header>

      <main className={styles.stage}>
        <div ref={stageRef} className={styles.bookViewport}>
          {loading ? (
            <div className={styles.bookLoading}>
              <BookOpen size={28} aria-hidden />
              <p>Opening your book…</p>
            </div>
          ) : error ? (
            <div className={styles.bookError}>
              <p>{error}</p>
              {onReadOnline ? (
                <button type="button" className={styles.fallbackBtn} onClick={onReadOnline}>
                  Read online edition
                </button>
              ) : null}
            </div>
          ) : totalPages > 0 && pageSize.width > 0 && pageSize.height > 0 ? (
            <LibraryStFlipbook
              key={bookKey}
              bookRef={bookRef}
              totalPages={totalPages}
              pageWidth={pageSize.width}
              pageHeight={pageSize.height}
              layout={layout}
              getPageSrc={getPageSrc}
              onFlip={handleFlip}
              onFlipStart={handleFlipStart}
            />
          ) : null}
        </div>
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

        <div className={styles.footerRow}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goPrev}
            disabled={isFirst || loading || Boolean(error)}
            aria-label="Previous page"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>

          <div className={styles.footerCenter}>
            <button
              type="button"
              className={styles.soundBtn}
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute page turn sound" : "Enable page turn sound"}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
            </button>
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
              disabled={loading || Boolean(error)}
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
