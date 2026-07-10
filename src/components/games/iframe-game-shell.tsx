"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";

import type { IframeGameData } from "@/data/games/catalog";

import styles from "./iframe-game-shell.module.css";

type IframeGameShellProps = {
  game: IframeGameData;
};

export function IframeGameShell({ game }: IframeGameShellProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { embedUrl, embedHeight } = game;

  const handleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  return (
    <div
      className={styles.shell}
      style={{ "--game-glow": `${game.accent}33` } as React.CSSProperties}
    >
      <div className={styles.ambientOrb1} aria-hidden />
      <div className={styles.ambientOrb2} aria-hidden />
      <div className={styles.stars} aria-hidden />

      <header className={styles.header}>
        <Link href="/games" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden />
          All games
        </Link>

        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>{game.badge}</span>
          <h1 className={styles.title}>
            {game.emoji} {game.title}
          </h1>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.actionBtn} onClick={handleFullscreen}>
            <Maximize2 size={15} aria-hidden />
            Fullscreen
          </button>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
          >
            <ExternalLink size={15} aria-hidden />
            New tab
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.frameWrap} ref={frameRef}>
          <div className={styles.frameTopBar}>
            <span className={`${styles.dot} ${styles.dotRed}`} />
            <span className={`${styles.dot} ${styles.dotYellow}`} />
            <span className={`${styles.dot} ${styles.dotGreen}`} />
            <span className={styles.frameLabel}>{game.title} — click inside to play</span>
          </div>
          <iframe
            src={embedUrl}
            title={game.title}
            className={styles.iframe}
            height={embedHeight}
            allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
            allowFullScreen
          />
        </div>

        <p className={styles.footer}>
          Game not loading?{" "}
          <a href={embedUrl} target="_blank" rel="noopener noreferrer">
            Open {game.title} in a new tab
          </a>
          <span className={styles.tip}>
            Tip: Unity games may take a moment to load — click inside the frame to start playing.
          </span>
        </p>
      </main>
    </div>
  );
}
