"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";

import { StoreItemIcon } from "./store-item-icon";
import styles from "./magical-store.module.css";

type Props = {
  items: ShopCatalogItem[];
  selectedId: string | null;
  ownedIds: Set<string>;
  onSelect: (item: ShopCatalogItem) => void;
  onScrollProgress: (progress: number) => void;
};

export function StoreFilmstrip({
  items,
  selectedId,
  ownedIds,
  onSelect,
  onScrollProgress,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !selectedId) return;
    const cell = track.querySelector<HTMLElement>(`[data-id="${selectedId}"]`);
    cell?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedId, items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const max = track.scrollWidth - track.clientWidth;
      onScrollProgress(max > 0 ? track.scrollLeft / max : 0);
    };

    onScroll();
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items, onScrollProgress]);

  return (
    <div className={styles.filmstrip} aria-label="Item filmstrip">
      <div className={styles.filmstripHead}>
        <p className={`${styles.filmstripLabel} font-nunito`}>Archive reel</p>
        <span className={`${styles.filmstripCount} font-nunito`}>
          {items.length} frames
        </span>
      </div>

      <div className={styles.filmstripReel}>
        <div className={styles.filmstripFadeLeft} aria-hidden />
        <div className={styles.filmstripFadeRight} aria-hidden />

        <div className={styles.filmstripTrack} ref={trackRef}>
          {items.map((item, index) => {
            const selected = selectedId === item.id;
            const owned = ownedIds.has(item.id);

            return (
              <motion.button
                key={item.id}
                type="button"
                data-id={item.id}
                className={[
                  styles.filmCell,
                  selected ? styles.filmCellActive : "",
                  owned ? styles.filmCellOwned : "",
                  item.featured ? styles.filmCellFeatured : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ "--cell-accent": item.accent } as CSSProperties}
                onClick={() => onSelect(item)}
                aria-pressed={selected}
                aria-label={`${item.title}${owned ? ", collected" : ""}`}
                whileTap={{ scale: 0.96 }}
              >
                <span className={styles.filmCellIndex} aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className={styles.filmCellWindow}>
                  {selected ? <span className={styles.filmCellBeam} aria-hidden /> : null}
                  <span className={styles.filmCellGlow} aria-hidden />
                  <span className={styles.filmCellIcon} aria-hidden>
                    <StoreItemIcon item={item} size="film" />
                  </span>
                  {item.featured ? (
                    <span className={styles.filmCellStar} aria-hidden>
                      <Sparkles size={9} />
                    </span>
                  ) : null}
                  {owned ? (
                    <span className={styles.filmCellSeal} aria-hidden>
                      <Check size={9} strokeWidth={3} />
                    </span>
                  ) : null}
                </span>

                <span className={`${styles.filmCellCaption} font-nunito`}>{item.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
