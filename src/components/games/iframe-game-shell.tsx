"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ExternalLink, Maximize2 } from "lucide-react";

import type { IframeGameData } from "@/data/games/catalog";

import styles from "./iframe-game-shell.module.css";

type IframeGameShellProps = {
  game: IframeGameData;
};

type PendingAttempt = {
  skillId: string;
  subject: string | null;
  lessonName: string | null;
  correct: boolean;
  firstTry: boolean;
};

const FLUSH_INTERVAL_MS = 4000;
const MAX_BUFFERED_ATTEMPTS = 500;

/**
 * Opens a game_sessions row, then bridges the game → platform:
 *  - listens for same-origin postMessages from the game (source:'aga-game')
 *  - buffers answered questions + latest coin total
 *  - flushes to /api/games/report so answers feed dashboards and coins become
 *    real, capped store points
 *  - closes the session on leave
 *
 * If Supabase isn't ready or the child isn't signed in as a student, the game
 * still plays — we just skip recording.
 */
function useGameBridge(gameSlug: string) {
  const sessionIdRef = useRef<string | null>(null);
  const attemptsRef = useRef<PendingAttempt[]>([]);
  const coinsTotalRef = useRef<number>(0);
  const dirtyRef = useRef<boolean>(false);
  const sendingRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const flush = (keepalive: boolean) => {
      const id = sessionIdRef.current;
      if (!id) return;
      if (!dirtyRef.current) return;
      if (sendingRef.current && !keepalive) return;

      const attempts = attemptsRef.current;
      attemptsRef.current = [];
      dirtyRef.current = false;
      sendingRef.current = true;

      const body = JSON.stringify({
        sessionId: id,
        attempts,
        coinsTotal: coinsTotalRef.current,
      });

      void fetch("/api/games/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive,
      })
        .catch(() => {
          // best-effort re-queue for the next interval flush
          if (!keepalive) {
            attemptsRef.current = [...attempts, ...attemptsRef.current].slice(-MAX_BUFFERED_ATTEMPTS);
            dirtyRef.current = true;
          }
        })
        .finally(() => {
          sendingRef.current = false;
        });
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as
        | { source?: string; type?: string; skillId?: unknown; subject?: unknown; lessonName?: unknown; correct?: unknown; firstTry?: unknown; total?: unknown }
        | null;
      if (!d || d.source !== "aga-game") return;

      if (d.type === "attempt" && typeof d.skillId === "string") {
        if (attemptsRef.current.length < MAX_BUFFERED_ATTEMPTS) {
          attemptsRef.current.push({
            skillId: d.skillId,
            subject: typeof d.subject === "string" ? d.subject : null,
            lessonName: typeof d.lessonName === "string" ? d.lessonName : null,
            correct: d.correct === true,
            firstTry: d.firstTry !== false,
          });
          dirtyRef.current = true;
        }
      } else if (d.type === "coins" && typeof d.total === "number") {
        coinsTotalRef.current = Math.max(coinsTotalRef.current, d.total);
        dirtyRef.current = true;
      }
    };

    window.addEventListener("message", onMessage);

    void (async () => {
      try {
        const res = await fetch("/api/games/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug }),
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { sessionId?: string };
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId;
          flush(false); // send anything buffered before the session opened
        }
      } catch {
        /* offline / tables not migrated yet — play anyway */
      }
    })();

    const interval = window.setInterval(() => flush(false), FLUSH_INTERVAL_MS);
    const onHide = () => flush(true);
    window.addEventListener("pagehide", onHide);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pagehide", onHide);
      flush(true);

      const id = sessionIdRef.current;
      if (!id) return;
      void fetch("/api/games/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, funCoins: coinsTotalRef.current }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [gameSlug]);
}

export function IframeGameShell({ game }: IframeGameShellProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  useGameBridge(game.id);

  const handleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen().catch(() => {
        /* iOS may block fullscreen — ignore */
      });
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
      className={`${styles.shell} game-play-shell`}
      style={{ "--game-glow": `${game.accent}33` } as React.CSSProperties}
    >
      <div className={styles.ambientOrb1} aria-hidden />
      <div className={styles.ambientOrb2} aria-hidden />
      <div className={styles.stars} aria-hidden />

      <header className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden />
          <span>{game.gameClass === "academic" ? "Game info" : "All games"}</span>
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
            <span>Fullscreen</span>
          </button>
          <a
            href={game.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
          >
            <ExternalLink size={15} aria-hidden />
            <span>New tab</span>
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.frameWrap} ref={frameRef}>
          <div className={styles.frameTopBar}>
            <span className={`${styles.dot} ${styles.dotRed}`} />
            <span className={`${styles.dot} ${styles.dotYellow}`} />
            <span className={`${styles.dot} ${styles.dotGreen}`} />
            <span className={styles.frameLabel}>
              {game.title} — tap inside to play
            </span>
          </div>
          <iframe
            src={game.embedUrl}
            title={game.title}
            className={styles.iframe}
            allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
            allowFullScreen
          />
        </div>

        <p className={styles.footer}>
          Game not loading?{" "}
          <a href={game.embedUrl} target="_blank" rel="noopener noreferrer">
            Open {game.title} in a new tab
          </a>
          <span className={styles.tip}>
            Tip: tap inside the frame to start. Academic games save progress when you&apos;re
            signed in.
          </span>
        </p>
      </main>
    </div>
  );
}
