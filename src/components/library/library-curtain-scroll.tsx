"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./library-page-reader.module.css";

const PLEAT_COUNT = 7;

type ThumbState = {
  top: number;
  height: number;
  visible: boolean;
};

type Props = {
  children: React.ReactNode;
  sheetRef?: (el: HTMLDivElement | null) => void;
};

function CurtainPleats() {
  return (
    <div className={styles.curtainPleats}>
      {Array.from({ length: PLEAT_COUNT }, (_, i) => (
        <span
          key={i}
          className={styles.curtainPleat}
          style={{ "--pleat-i": i } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function LibraryCurtainScroll({ children, sheetRef }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<ThumbState>({
    top: 0,
    height: 48,
    visible: false,
  });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 2) {
      setThumb({ top: 0, height: clientHeight, visible: false });
      return;
    }

    const height = Math.max(44, (clientHeight / scrollHeight) * clientHeight);
    const maxTop = clientHeight - height;
    const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop;

    setThumb({ top, height, visible: true });
  }, []);

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      sheetRef?.(el);
    },
    [sheetRef],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateThumb();
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);

    return () => ro.disconnect();
  }, [updateThumb, children]);

  const onThumbPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const el = scrollRef.current;
    if (!el || !thumb.visible) return;

    const startY = e.clientY;
    const startScroll = el.scrollTop;
    const { scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const maxThumbTop = clientHeight - thumb.height;

    const onMove = (ev: PointerEvent) => {
      if (maxThumbTop <= 0) return;
      const dy = ev.clientY - startY;
      el.scrollTop = Math.min(
        maxScroll,
        Math.max(0, startScroll + (dy / maxThumbTop) * maxScroll),
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className={styles.curtainFrame}>
      <div className={styles.curtainSide} data-side="left" aria-hidden>
        <div className={styles.curtainRod}>
          <span className={styles.curtainRodBar} />
          <span className={styles.curtainRing} />
          <span className={styles.curtainRing} />
        </div>
        <CurtainPleats />
        <span className={styles.curtainHem} />
        <span className={styles.curtainCastShadow} />
      </div>

      <div className={styles.curtainViewport}>
        <div className={styles.pagePaperEdge} aria-hidden />
        <div ref={setRefs} className={styles.curtainScroll} onScroll={updateThumb}>
          {children}
        </div>
      </div>

      <div className={styles.curtainSide} data-side="right" aria-hidden>
        <div className={styles.curtainRod}>
          <span className={styles.curtainRodBar} />
          <span className={styles.curtainRing} />
          <span className={styles.curtainRing} />
        </div>
        <CurtainPleats />
        <span className={styles.curtainHem} />

        {thumb.visible ? (
          <div className={styles.curtainTrack}>
            <button
              type="button"
              className={styles.curtainThumb}
              style={{ top: thumb.top, height: thumb.height }}
              onPointerDown={onThumbPointerDown}
              aria-label="Drag curtain cord to scroll"
            >
              <span className={styles.curtainCord} />
              <span className={styles.curtainGather} />
              <span className={styles.curtainThumbFabric} />
              <span className={styles.curtainTassel}>
                <span className={styles.tasselCap} />
                <span className={styles.tasselStrand} />
                <span className={styles.tasselStrand} />
                <span className={styles.tasselStrand} />
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
