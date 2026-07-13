"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Library } from "lucide-react";

import {
  type LibraryNovel,
  type LibraryWingId,
} from "@/lib/library/library-catalog";
import {
  LIBRARY_HUB_HOME_REGION,
  LIBRARY_HUB_HOTSPOTS,
  doorTransformOrigin,
  type LibraryHotspot,
  type LibraryHotspotRegion,
} from "@/lib/library/library-hotspots";
import { LIBRARY_HUB_ASPECT, LIBRARY_HUB_BACKGROUND_SRC } from "@/lib/library/library-art";

import styles from "./library-scene.module.css";

/** Below this width: letterbox + engagement (phones + iPads). At/above: full-screen stretch. */
const HUB_FULLSCREEN_MIN_WIDTH = 1200;
/** Total time before navigating to the shelf (ms). */
export const LIBRARY_DOOR_OPEN_MS = 1850;

const SMOOTH_EASE = [0.25, 0.1, 0.25, 1] as const;

type DoorTransition = {
  wing: LibraryWingId | "all";
  origin: string;
  label: string;
};

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
  disabled,
  onDoorClick,
}: {
  spot: LibraryHotspot;
  novels: LibraryNovel[];
  disabled: boolean;
  onDoorClick: (spot: LibraryHotspot) => void;
}) {
  const count = bookCountForWing(novels, spot.wing);

  return (
    <button
      type="button"
      className={styles.hubHotspot}
      style={regionStyle(spot.region)}
      onClick={() => onDoorClick(spot)}
      disabled={disabled}
      aria-label={`${spot.label}. ${spot.hint}. ${count} books`}
      title={`${spot.label} — ${count} ${count === 1 ? "book" : "books"}`}
    />
  );
}

export function LibraryHubScene({ novels, loading = false, onEnter }: Props) {
  const artboardRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);
  const [doorTransition, setDoorTransition] = useState<DoorTransition | null>(null);
  const isTransitioning = doorTransition !== null;

  const beginDoorTransition = useCallback(
    (spot: LibraryHotspot) => {
      if (isTransitioning) return;

      const wing = spot.wing ?? "all";
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onEnter(wing);
        return;
      }

      setDoorTransition({
        wing,
        origin: doorTransformOrigin(spot.region),
        label: spot.label,
      });
    },
    [isTransitioning, onEnter],
  );

  useEffect(() => {
    if (!doorTransition) return;

    const timer = window.setTimeout(() => {
      onEnter(doorTransition.wing);
    }, LIBRARY_DOOR_OPEN_MS);

    return () => window.clearTimeout(timer);
  }, [doorTransition, onEnter]);

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
      <motion.header
        className={styles.hubTop}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.4, ease: SMOOTH_EASE }}
      >
        <Link href="/" className={styles.hubHome}>
          <ArrowLeft size={16} aria-hidden />
          Home
        </Link>
        <span className={styles.hubBrand}>
          <Library size={15} aria-hidden />
          Library Labyrinth
        </span>
      </motion.header>

      <div
        ref={artboardRef}
        className={`${styles.hubArtboard}${isFullscreen ? ` ${styles.hubArtboardFullscreen}` : ""}${isTransitioning ? ` ${styles.hubArtboardTransitioning}` : ""}`}
        aria-label={loading ? "Loading stories" : "Library Labyrinth"}
      >
        <div
          className={`${styles.hubArtFrame}${isFullscreen ? ` ${styles.hubArtFrameFullscreen}` : ""}`}
          style={
            !isFullscreen && frameSize
              ? { width: `${frameSize.width}px`, height: `${frameSize.height}px` }
              : undefined
          }
        >
          <motion.div
            className={styles.hubZoomLayer}
            style={{ transformOrigin: doorTransition?.origin ?? "50% 73%" }}
            animate={{ scale: doorTransition ? 5.8 : 1 }}
            transition={{
              duration: 1.72,
              ease: SMOOTH_EASE,
            }}
          >
            <img
              src={LIBRARY_HUB_BACKGROUND_SRC}
              alt="The Library Labyrinth — choose a door to begin reading"
              className={styles.hubArtImage}
              decoding="async"
              fetchPriority="high"
            />
          </motion.div>

          {!isTransitioning ? (
            <div className={styles.hubHotspots}>
              <Link
                href="/"
                className={styles.hubHotspot}
                style={regionStyle(LIBRARY_HUB_HOME_REGION)}
                aria-label="Home"
              />

              {LIBRARY_HUB_HOTSPOTS.map((spot) => (
                <HubDoorHotspot
                  key={spot.id}
                  spot={spot}
                  novels={novels}
                  disabled={false}
                  onDoorClick={beginDoorTransition}
                />
              ))}
            </div>
          ) : null}
        </div>

        <AnimatePresence>
          {doorTransition ? (
            <>
              <motion.div
                key="door-bloom"
                className={styles.hubDoorBloom}
                style={{ "--door-origin": doorTransition.origin } as CSSProperties}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.55, ease: SMOOTH_EASE }}
                aria-hidden
              />
              <motion.div
                key="door-veil"
                className={styles.hubDoorVeil}
                style={{ "--door-origin": doorTransition.origin } as CSSProperties}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.35, delay: 0.2, ease: SMOOTH_EASE }}
                aria-hidden
              />
              <motion.div
                key="door-wash"
                className={styles.hubDoorWash}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.75, ease: SMOOTH_EASE }}
                aria-hidden
              />
            </>
          ) : null}
        </AnimatePresence>

        {!isFullscreen && !isTransitioning ? (
          <div className={styles.hubLetterboxEngage} aria-hidden>
            <p className={styles.hubLetterboxHint}>Tap a magical door to begin</p>
            <p className={styles.hubLetterboxCount}>{novels.length} adventures ready tonight</p>
          </div>
        ) : null}

        <AnimatePresence>
          {doorTransition ? (
            <motion.p
              key="door-caption"
              className={styles.hubDoorCaption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: SMOOTH_EASE }}
            >
              Opening {doorTransition.label}…
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
