"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";

import type { IframeGameData } from "@/data/games/catalog";

import styles from "./iframe-game-shell.module.css";

type IframeGameShellProps = {
  game: IframeGameData;
};

/**
 * Starts a game_sessions row when the player opens the game, and closes it on
 * leave. If Supabase tables aren't ready yet (or the student isn't signed in),
 * the game still plays — we just skip recording.
 */
function useGameSession(gameSlug: string) {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/games/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { sessionId?: string };
        if (data.sessionId) sessionIdRef.current = data.sessionId;
      } catch {
        /* offline / tables not migrated yet — play anyway */
      }
    })();

    return () => {
      cancelled = true;
      const id = sessionIdRef.current;
      if (!id) return;
      // keepalive so the request survives page navigation
      void fetch("/api/games/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [gameSlug]);
}

export function IframeGameShell({ game }: IframeGameShellProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { embedUrl, embedHeight } = game;
  useGameSession(game.id);

  const handleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, []);

  const backHref =
    game.gameClass === "academic" && game.worldSlug
      ? `/worlds/${game.worldSlug}`
      : game.gameClass === "academic"
        ? `/games/${game.id}`
        : "/games";

  return (
    <div
      className={styles.shell}
      style={{ "--game-glow": `${game.accent}33` } as React.CSSProperties}
    >
      <div className={styles.ambientOrb1} aria-hidden />
      <div className={styles.ambientOrb2} aria-hidden />
      <div className={styles.stars} aria-hidden />

      <header className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden />
          {game.gameClass === "academic" ? "Game info" : "All games"}
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
            Tip: click inside the frame to start. Academic games save progress when you&apos;re
            signed in (after the database tables are connected).
          </span>
        </p>
      </main>
    </div>
  );
}
