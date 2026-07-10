"use client";

import styles from "./magical-store.module.css";

const DUST = [
  { top: "18%", left: "12%", delay: "0s", size: 2 },
  { top: "32%", left: "28%", delay: "1.4s", size: 1.5 },
  { top: "24%", left: "62%", delay: "0.7s", size: 2.5 },
  { top: "48%", left: "8%", delay: "2.1s", size: 1.5 },
  { top: "42%", left: "44%", delay: "1.1s", size: 2 },
  { top: "58%", left: "72%", delay: "0.3s", size: 1.5 },
  { top: "68%", left: "22%", delay: "1.9s", size: 2 },
  { top: "14%", left: "84%", delay: "2.6s", size: 1.5 },
] as const;

export function StoreAmbientDust() {
  return (
    <div className={styles.ambientDust} aria-hidden>
      {DUST.map((p, i) => (
        <span
          key={i}
          className={styles.dustMote}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
