"use client";

import Image from "next/image";

import { LIBRARY_ART } from "@/lib/library/library-art";

import styles from "./library-scene.module.css";

type Props = {
  /** Slightly darken for text readability over the art */
  dim?: "none" | "light" | "medium";
  /**
   * Hub fills the viewport edge-to-edge (`cover`). Shelf scenes use default crop.
   */
  focus?: "scene" | "characters";
};

export function LibrarySceneBackground({ dim = "light", focus = "scene" }: Props) {
  return (
    <div className={styles.sceneBgLayer} aria-hidden>
      <Image
        src={LIBRARY_ART.background}
        alt=""
        fill
        className={`${styles.sceneBgImg}${focus === "characters" ? ` ${styles.sceneBgImgHub}` : ""}`}
        sizes="100vw"
        priority
      />
      <div
        className={`${styles.sceneBgScrim}${dim === "none" ? ` ${styles.sceneBgScrimNone}` : ""}${dim === "medium" ? ` ${styles.sceneBgScrimMedium}` : ""}`}
      />
    </div>
  );
}
