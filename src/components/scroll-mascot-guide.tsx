"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import sparkIdle from "@/assets/images/scroll-buddy/spark-idle.png";
import sparkScrollDown from "@/assets/images/scroll-buddy/spark-scroll-down.png";
import sparkScrollUp from "@/assets/images/scroll-buddy/spark-scroll-up.png";
import { ScrollBuddySprite } from "@/components/scroll-buddy-sprite";
import styles from "./scroll-mascot-guide.module.css";

type ScrollDirection = "up" | "down" | "idle";

const SPARK_POSES: Record<ScrollDirection, typeof sparkIdle> = {
  idle: sparkIdle,
  down: sparkScrollDown,
  up: sparkScrollUp,
};

export function ScrollMascotGuide() {
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const directionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [progress, setProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [direction, setDirection] = useState<ScrollDirection>("idle");
  const [hint, setHint] = useState("Drag or click Spark");

  const measure = useCallback(() => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    const scrollable = maxScroll > 64;
    setCanScroll(scrollable);

    if (!scrollable) {
      setProgress(0);
      return;
    }

    const next = maxScroll === 0 ? 0 : window.scrollY / maxScroll;
    setProgress(Math.min(1, Math.max(0, next)));

    const delta = window.scrollY - lastScrollY.current;
    if (Math.abs(delta) > 1) {
      const nextDir: ScrollDirection = delta > 0 ? "down" : "up";
      setDirection(nextDir);
      setHint(nextDir === "down" ? "Scrolling down" : "Scrolling up");

      if (directionTimer.current) clearTimeout(directionTimer.current);
      directionTimer.current = setTimeout(() => {
        setDirection("idle");
        setHint("Drag or click Spark");
      }, 450);
    }

    lastScrollY.current = window.scrollY;
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (directionTimer.current) clearTimeout(directionTimer.current);
    };
  }, [measure]);

  useEffect(() => {
    const nav = document.querySelector(".top-nav");
    if (!nav) return;

    const syncNavHeight = () => {
      const height = Math.ceil(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--aga-top-nav-height",
        `${height}px`,
      );
    };

    syncNavHeight();
    const observer = new ResizeObserver(syncNavHeight);
    observer.observe(nav);
    window.addEventListener("resize", syncNavHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncNavHeight);
    };
  }, []);

  const scrollToProgress = useCallback((ratio: number) => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * ratio, behavior: "smooth" });
  }, []);

  const onTrackClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      scrollToProgress(Math.min(1, Math.max(0, ratio)));
    },
    [scrollToProgress],
  );

  const scrollByPage = useCallback((dir: -1 | 1) => {
    window.scrollBy({ top: dir * window.innerHeight * 0.72, behavior: "smooth" });
  }, []);

  const showOnLearnRoutes =
    pathname === "/learn" || pathname?.startsWith("/learn/");

  if (!canScroll || !showOnLearnRoutes) return null;

  const mascotClass =
    direction === "down"
      ? styles.mascotDown
      : direction === "up"
        ? styles.mascotUp
        : styles.mascotIdle;

  const sparkSrc = SPARK_POSES[direction];
  const topPercent = `${progress * 100}%`;

  return (
    <aside
      className={`${styles.root} ${styles.rootVisible}`}
      aria-label="Scroll guide with Spark"
    >
      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowTop}`}
        onClick={() => scrollByPage(-1)}
        aria-label="Scroll up"
      >
        <ChevronUp size={14} strokeWidth={2.5} aria-hidden />
      </button>

      <div
        ref={trackRef}
        className={styles.track}
        onClick={onTrackClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Page scroll position"
      >
        <div className={styles.trackGroove} aria-hidden>
          <div
            className={styles.trackFill}
            style={{ height: `${Math.max(4, progress * 100)}%` }}
          >
            <span className={styles.trackThumb} />
          </div>
        </div>
      </div>

      <span className={styles.progressLabel} aria-hidden>
        {Math.round(progress * 100)}%
      </span>

      <div
        className={styles.mascotWrap}
        style={{ top: topPercent }}
        onClick={(e) => {
          e.stopPropagation();
          scrollByPage(direction === "up" ? -1 : 1);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollByPage(direction === "up" ? -1 : 1);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Spark scroll buddy. Click to scroll."
      >
        <span className={styles.hint}>{hint}</span>
        <div className={styles.mascotPlate}>
          <div className={`${styles.mascotInner} ${mascotClass}`}>
            <ScrollBuddySprite
              key={direction}
              src={sparkSrc}
              className={styles.mascotImg}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.arrowBtn} ${styles.arrowBottom}`}
        onClick={() => scrollByPage(1)}
        aria-label="Scroll down"
      >
        <ChevronDown size={14} strokeWidth={2.5} aria-hidden />
      </button>
    </aside>
  );
}
