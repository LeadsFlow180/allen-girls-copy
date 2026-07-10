"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gem, Lock, Sparkles, Zap } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";
import { SHOP_KIND_LABELS } from "@/lib/learn/shop-catalog";

import styles from "./magical-store.module.css";

const TIER_LABELS: Record<number, string> = {
  1: "Common",
  2: "Rare",
  3: "Epic",
  4: "Legend",
  5: "Mythic",
};

type Props = {
  item: ShopCatalogItem | null;
  owned: boolean;
  canAfford: boolean;
  onBuy: () => void;
};

export function StoreSpotlight({ item, owned, canAfford, onBuy }: Props) {
  if (!item) {
    return (
      <div className={styles.dossierEmpty}>
        <p className={`${styles.dossierEmptyText} font-nunito`}>Select a relic from the index.</p>
      </div>
    );
  }

  const isBundle = item.kind === "gem_bundle";

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={item.id}
        className={styles.dossier}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className={styles.dossierHead}>
          <span className={`${styles.dossierKind} font-nunito`}>
            {SHOP_KIND_LABELS[item.kind]}
          </span>
          <span className={`${styles.dossierTier} font-nunito`}>{TIER_LABELS[item.tier]}</span>
          {item.featured ? (
            <span className={`${styles.dossierFeatured} font-nunito`}>
              <Sparkles size={10} aria-hidden />
              Curator&apos;s choice
            </span>
          ) : null}
        </header>

        <div className={styles.tierMeter} aria-label={`Tier ${item.tier} of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`${styles.tierDot} ${i < item.tier ? styles.tierDotLit : ""}`}
            />
          ))}
        </div>

        <h2 className={`${styles.dossierTitle} font-fredoka`}>{item.title}</h2>
        <p className={`${styles.dossierDesc} font-nunito`}>{item.description}</p>

        <div className={styles.dossierActions}>
          {owned ? (
            <span className={`${styles.dossierOwned} font-nunito`}>In collection</span>
          ) : (
            <>
              <span className={`${styles.dossierPrice} font-nunito`}>
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
                className={`${styles.dossierBuy} font-nunito ${canAfford ? styles.dossierBuyReady : ""}`}
                disabled={!canAfford}
                onClick={onBuy}
              >
                {canAfford ? (
                  isBundle ? "Exchange" : "Acquire relic"
                ) : (
                  <>
                    <Lock size={13} aria-hidden />
                    Insufficient funds
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.article>
    </AnimatePresence>
  );
}
