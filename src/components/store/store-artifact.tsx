"use client";

import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";

import { StoreItemIcon } from "./store-item-icon";
import styles from "./magical-store.module.css";

type Props = {
  item: ShopCatalogItem | null;
  index: number;
  total: number;
};

export function StoreArtifact({ item, index, total }: Props) {
  return (
    <div className={styles.artifactViewport} aria-hidden={!item}>
      <span className={`${styles.artifactBracket} ${styles.artifactBracketTl}`} />
      <span className={`${styles.artifactBracket} ${styles.artifactBracketTr}`} />
      <span className={`${styles.artifactBracket} ${styles.artifactBracketBl}`} />
      <span className={`${styles.artifactBracket} ${styles.artifactBracketBr}`} />

      <div className={styles.artifactGrid} />
      <div className={styles.artifactScan} />

      <AnimatePresence mode="wait">
        {item ? (
          <motion.div
            key={item.id}
            className={[
              styles.artifactCore,
              styles[`artifactTier${item.tier}` as keyof typeof styles],
              item.featured ? styles.artifactFeatured : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--accent": item.accent } as CSSProperties}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.artifactCoord}>
              Relic {String(index + 1).padStart(2, "0")} · {String(total).padStart(2, "0")}
            </span>

            <div className={styles.artifactRing} />
            <div className={styles.artifactRingInner} />
            <div className={styles.artifactRingPulse} />

            <motion.span
              className={styles.artifactIcon}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <StoreItemIcon item={item} size="hero" />
            </motion.span>

            <div className={styles.artifactPedestal} />
            <div className={styles.artifactGlow} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
