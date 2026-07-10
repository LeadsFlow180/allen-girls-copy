"use client";

import type { CSSProperties } from "react";
import { Gem, Sparkles, Zap } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";

import { StoreItemIcon } from "./store-item-icon";
import styles from "./magical-store.module.css";

type Props = {
  item: ShopCatalogItem;
  index: number;
  selected: boolean;
  owned: boolean;
  onSelect: () => void;
};

export function StoreRelicRow({ item, index, selected, owned, onSelect }: Props) {
  const isBundle = item.kind === "gem_bundle";

  return (
    <button
      type="button"
      className={[
        styles.relicRow,
        selected ? styles.relicRowActive : "",
        owned ? styles.relicRowOwned : "",
        item.featured ? styles.relicRowFeatured : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--row-accent": item.accent } as CSSProperties}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.relicIndex}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.relicIcon} aria-hidden>
        <StoreItemIcon item={item} size="relic" />
      </span>
      <span className={styles.relicCopy}>
        <span className={`${styles.relicTitle} font-fredoka`}>
          {item.featured ? (
            <Sparkles size={10} className={styles.relicStar} aria-hidden />
          ) : null}
          {item.title}
        </span>
        <span className={`${styles.relicMeta} font-nunito`}>
          {owned ? "Collected" : isBundle ? `${item.priceXp} XP` : `${item.priceGems} gems`}
        </span>
      </span>
      <span className={styles.relicTierDots} aria-hidden>
        {Array.from({ length: item.tier }, (_, i) => (
          <span key={i} className={styles.relicTierDot} />
        ))}
      </span>
      <span className={styles.relicPrice} aria-hidden>
        {owned ? "✓" : isBundle ? <Zap size={12} /> : <Gem size={12} />}
      </span>
    </button>
  );
}
