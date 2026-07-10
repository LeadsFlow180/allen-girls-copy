"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { Gem, Sparkles, Zap } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";

import { StoreItemIcon } from "./store-item-icon";
import styles from "./magical-store.module.css";

type Props = {
  item: ShopCatalogItem;
  selected: boolean;
  owned: boolean;
  onSelect: () => void;
};

export function StoreProductCard({ item, selected, owned, onSelect }: Props) {
  const isBundle = item.kind === "gem_bundle";

  return (
    <motion.button
      type="button"
      className={[
        styles.shelfCard,
        selected ? styles.shelfCardSelected : "",
        owned ? styles.shelfCardOwned : "",
        item.featured ? styles.shelfCardFeatured : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--card-accent": item.accent } as CSSProperties}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${item.title}, ${owned ? "owned" : isBundle ? `${item.priceXp} XP` : `${item.priceGems} gems`}`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {item.featured ? (
        <span className={`${styles.shelfRibbon} font-nunito`}>
          <Sparkles size={9} aria-hidden />
          Hot
        </span>
      ) : null}

      <div className={styles.shelfIconStage}>
        <div className={styles.shelfIconGlow} aria-hidden />
        <span className={styles.shelfIcon} aria-hidden>
          <StoreItemIcon item={item} size="card" />
        </span>
        <div className={styles.shelfPedestal} aria-hidden />
      </div>

      <span className={`${styles.shelfTitle} font-fredoka`}>{item.title}</span>
      <span className={`${styles.shelfPrice} font-nunito`}>
        {owned ? (
          "Owned"
        ) : isBundle ? (
          <>
            <Zap size={12} aria-hidden /> {item.priceXp}
          </>
        ) : (
          <>
            <Gem size={12} aria-hidden /> {item.priceGems}
          </>
        )}
      </span>
    </motion.button>
  );
}
