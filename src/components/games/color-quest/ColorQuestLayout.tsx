import type { ReactNode } from "react";

import styles from "./color-quest-layout.module.css";

// Fixed star positions/opacities so server and client render the same (avoids hydration mismatch)
const STARS = [
  { top: 8, left: 12, opacity: 0.35 },
  { top: 15, left: 88, opacity: 0.52 },
  { top: 22, left: 45, opacity: 0.41 },
  { top: 31, left: 6, opacity: 0.28 },
  { top: 38, left: 72, opacity: 0.61 },
  { top: 44, left: 33, opacity: 0.47 },
  { top: 52, left: 95, opacity: 0.39 },
  { top: 58, left: 19, opacity: 0.54 },
  { top: 63, left: 61, opacity: 0.43 },
  { top: 71, left: 4, opacity: 0.31 },
  { top: 76, left: 78, opacity: 0.48 },
  { top: 82, left: 26, opacity: 0.59 },
  { top: 90, left: 54, opacity: 0.37 },
  { top: 5, left: 67, opacity: 0.44 },
  { top: 41, left: 91, opacity: 0.56 },
  { top: 67, left: 39, opacity: 0.29 },
  { top: 12, left: 23, opacity: 0.63 },
  { top: 85, left: 14, opacity: 0.46 },
  { top: 49, left: 81, opacity: 0.51 },
  { top: 96, left: 48, opacity: 0.33 },
];

interface ColorQuestLayoutProps {
  badge?: string;
  title: string;
  subtitle?: string;
  sparkMessage: ReactNode;
  progressPercent: number;
  isComplete: boolean;
  rightAside: ReactNode;
  children: ReactNode;
}

export function ColorQuestLayout({
  badge = "Game Zone",
  title,
  subtitle,
  sparkMessage,
  progressPercent,
  rightAside,
  children,
}: ColorQuestLayoutProps) {
  return (
    <div className={`${styles.shell} game-play-shell`}>
      {STARS.map((star, i) => (
        <div
          key={i}
          className={styles.star}
          style={{
            opacity: star.opacity,
            top: `${star.top}%`,
            left: `${star.left}%`,
          }}
          aria-hidden
        />
      ))}

      <header className={styles.header}>
        <p className={styles.badge}>Allen Girls Adventures · {badge}</p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.spark}>
        <span className={styles.sparkLabel}>S.P.A.R.K.:</span> {sparkMessage}
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressMeta}>
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainPane}>{children}</div>
        <aside className={styles.asidePane}>{rightAside}</aside>
      </div>
    </div>
  );
}
