"use client";

import type { CSSProperties } from "react";
import { Gem, Lock, Sparkles, Zap } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";
import { SHOP_KIND_LABELS } from "@/lib/learn/shop-catalog";

import { StoreItemIcon } from "./store-item-icon";
import styles from "./magical-store.module.css";

type Props = {
  item: ShopCatalogItem;
  owned: boolean;
  canAfford: boolean;
  onBuy: () => void;
};

const TIER_LABELS: Record<number, string> = {
  1: "Common",
  2: "Rare",
  3: "Epic",
  4: "Legend",
  5: "Mythic",
};

export function MagicalStoreStall({
  item,
  owned,
  canAfford,
  onBuy,
}: Props) {
  const isBundle = item.kind === "gem_bundle";

  return (
    <article
      className={`${styles.card} ${item.featured ? styles.cardFeatured : ""}`}
      style={{ "--card-accent": item.accent } as CSSProperties}
    >
      <div className={styles.cardAccent} aria-hidden />

      {item.featured ? (
        <span className={`${styles.featuredRibbon} font-nunito`}>
          <Sparkles size={10} aria-hidden />
          Featured
        </span>
      ) : null}

      <div className={styles.cardInner}>
        <div className={styles.cardMeta}>
          <span className={`${styles.kindTag} font-nunito`}>
            {SHOP_KIND_LABELS[item.kind]}
          </span>
          <span className={`${styles.tierTag} font-nunito`}>
            {TIER_LABELS[item.tier]}
          </span>
        </div>

        <div className={styles.showcase}>
          <div className={styles.showcaseGlow} aria-hidden />
          <span className={styles.showcaseIcon} aria-hidden>
            <StoreItemIcon item={item} size="card" />
          </span>
          <div className={styles.showcasePedestal} aria-hidden />
        </div>

        <h3 className={`${styles.cardTitle} font-fredoka`}>{item.title}</h3>
        <p className={`${styles.cardDesc} font-nunito`}>{item.description}</p>

        <div className={styles.cardFoot}>
          {owned ? (
            <span className={`${styles.ownedBadge} font-nunito`}>In collection</span>
          ) : (
            <>
              <span className={`${styles.price} font-nunito`}>
                {isBundle ? (
                  <>
                    <Zap size={14} aria-hidden />
                    <strong>{item.priceXp ?? 0}</strong> XP
                  </>
                ) : (
                  <>
                    <Gem size={14} aria-hidden />
                    <strong>{item.priceGems}</strong>
                  </>
                )}
              </span>
              <button
                type="button"
                className={`${styles.buyBtn} font-nunito`}
                disabled={!canAfford}
                onClick={onBuy}
              >
                {canAfford ? (
                  isBundle ? "Exchange" : "Acquire"
                ) : (
                  <>
                    <Lock size={12} aria-hidden /> Locked
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
