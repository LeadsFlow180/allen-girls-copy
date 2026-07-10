"use client";

import Image from "next/image";

import { STORE_ART } from "@/lib/store/store-art";

import styles from "./magical-store.module.css";

type Props = {
  scrollProgress: number;
};

export function StoreEnvironment({ scrollProgress }: Props) {
  // Centered pan: scroll left/right on the reel shifts view symmetrically (no left drift)
  const panX = (scrollProgress - 0.5) * 8;

  return (
    <div className={styles.env} aria-hidden>
      <div className={styles.envSky}>
        <Image
          src={STORE_ART.heroPanorama}
          alt=""
          fill
          className={styles.envSkyImg}
          priority
          sizes="100vw"
          style={{ objectPosition: `${50 + panX}% 40%` }}
        />
      </div>

      {/* Covers Gemini watermark baked into bottom-right of panorama */}
      <div className={styles.envWatermarkCover} />

      <div className={styles.envFairyCss} />
      <div className={styles.envLanternPulse} />
      <div className={styles.envFloorCss} />

      <div className={styles.envVignette} />
      <div className={styles.envGrain} />
    </div>
  );
}
