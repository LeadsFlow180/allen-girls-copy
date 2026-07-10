"use client";

import { AnimatePresence, motion } from "framer-motion";

import styles from "./magical-store.module.css";

const BURSTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${12 + (i * 17) % 76}%`,
  delay: (i % 6) * 0.04,
  rotate: (i * 41) % 360,
}));

type Props = {
  active: boolean;
};

export function StorePurchaseBurst({ active }: Props) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className={styles.purchaseBurst}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          {BURSTS.map((p) => (
            <span
              key={p.id}
              className={styles.burstSpark}
              style={{
                left: p.left,
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.rotate}deg)`,
              }}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
