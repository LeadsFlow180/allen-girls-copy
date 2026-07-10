"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";

import {
  type LibraryNovel,
  type LibraryWingId,
} from "@/lib/library/library-catalog";
import {
  LIBRARY_HUB_HOME_REGION,
  LIBRARY_HUB_HOTSPOTS,
  type LibraryHotspot,
  type LibraryHotspotRegion,
} from "@/lib/library/library-hotspots";
import { LIBRARY_HUB_ASPECT, LIBRARY_HUB_BACKGROUND_SRC } from "@/lib/library/library-art";

import styles from "./library-scene.module.css";

/** Below this width: letterbox + engagement (phones + iPads). At/above: full-screen stretch. */
const HUB_FULLSCREEN_MIN_WIDTH = 1200;

type Props = {
  novels: LibraryNovel[];
  loading?: boolean;
  onEnter: (wing: LibraryWingId | "all") => void;
};

function bookCountForWing(novels: LibraryNovel[], wing: LibraryWingId | "all" | undefined): number {
  if (!wing || wing === "all") return novels.length;
  return novels.filter((n) => n.wing === wing).length;
}

function regionStyle(region: LibraryHotspotRegion): CSSProperties {
  return {
    left: `${region.left}%`,
    top: `${region.top}%`,
    width: `${region.width}%`,
    height: `${region.height}%`,
  };
}

function HubDoorHotspot({
  spot,
  novels,
  onEnter,
}: {
  spot: LibraryHotspot;
  novels: LibraryNovel[];
  onEnter: (wing: LibraryWingId | "all") => void;
}) {
  const count = bookCountForWing(novels, spot.wing);

  return (
    <button
      type="button"
      className={styles.hubHotspot}
      style={regionStyle(spot.region)}
      onClick={() => onEnter(spot.wing ?? "all")}
      aria-label={`${spot.label}. ${spot.hint}. ${count} books`}
      title={`${spot.label} — ${count} ${count === 1 ? "book" : "books"}`}
    />
  );
}

export function LibraryHubScene({ novels, loading = false, onEnter }: Props) {
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${HUB_FULLSCREEN_MIN_WIDTH}px)`);
    const sync = () => setIsFullscreen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      setFrameSize(null);
      return;
    }

    const element = artboardRef.current;
    if (!element) return;

    const updateFrame = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;

      const frameWidth = Math.min(width, height * LIBRARY_HUB_ASPECT);
      const frameHeight = frameWidth / LIBRARY_HUB_ASPECT;
      setFrameSize({ width: frameWidth, height: frameHeight });
    };

    updateFrame();

    const observer = new ResizeObserver(updateFrame);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isFullscreen]);

  return (
    <div className={styles.hub}>
      <header className={styles.hubTop}>
        <Link href="/" className={styles.hubHome}>
          <ArrowLeft size={16} aria-hidden />
          Home
        </Link>
        <span className={styles.hubBrand}>
          <Library size={15} aria-hidden />
          Library Labyrinth
        </span>
      </header>

      <div
        ref={artboardRef}
        className={`${styles.hubArtboard}${isFullscreen ? ` ${styles.hubArtboardFullscreen}` : ""}`}
        aria-label={loading ? "Loading stories" : "Library Labyrinth"}
      >
        <div
          className={`${styles.hubArtFrame}${isFullscreen ? ` ${styles.hubArtFrameFullscreen}` : ""}`}
          style={
            !isFullscreen && frameSize
              ? ({ width: `${frameSize.width}px`, height: `${frameSize.height}px` } as CSSProperties)
              : undefined
          }
        >
          {/* Native img avoids Next/Image fill remount bugs on mobile back navigation */}
          <img
            src={LIBRARY_HUB_BACKGROUND_SRC}
            alt="The Library Labyrinth — choose a door to begin reading"
            className={styles.hubArtImage}
            decoding="async"
            fetchPriority="high"
          />

          <div className={styles.hubHotspots}>
            <Link
              href="/"
              className={styles.hubHotspot}
              style={regionStyle(LIBRARY_HUB_HOME_REGION)}
              aria-label="Home"
            />

            {LIBRARY_HUB_HOTSPOTS.map((spot) => (
              <HubDoorHotspot key={spot.id} spot={spot} novels={novels} onEnter={onEnter} />
            ))}
          </div>
        </div>

        {!isFullscreen ? (
          <div className={styles.hubLetterboxEngage} aria-hidden>
            <p className={styles.hubLetterboxHint}>Tap a magical door to begin</p>
            <p className={styles.hubLetterboxCount}>{novels.length} adventures ready tonight</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
