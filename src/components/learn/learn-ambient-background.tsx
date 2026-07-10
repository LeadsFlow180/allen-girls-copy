import Image from "next/image";
import exploreGameBg from "@/assets/images/learn/explore-game-background.png";
import styles from "./learn-ambient-background.module.css";

/** Full-page sky + hills behind Learn shell (presentation only). */
export function LearnAmbientBackground() {
  return (
    <div className={styles.root} aria-hidden>
      <Image
        src={exploreGameBg}
        alt=""
        fill
        className={styles.bgImage}
        sizes="100vw"
        priority={false}
      />
      <div className={styles.skyGradient} />
      <div className={styles.vignette} />
      <span className={styles.sun} />
      <span className={`${styles.cloud} ${styles.cloudA}`} />
      <span className={`${styles.cloud} ${styles.cloudB}`} />
      <span className={styles.hillBack} />
      <span className={styles.hillFront} />
    </div>
  );
}
