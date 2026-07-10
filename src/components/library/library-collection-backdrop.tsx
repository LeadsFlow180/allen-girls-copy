"use client";

import Image from "next/image";
import { LIBRARY_ART } from "@/lib/library/library-art";
import styles from "./library-collection.module.css";

/** Rich library backdrop — vivid art, no white wash. */
export function LibraryCollectionBackdrop() {
  return (
    <div className={styles.ambient} aria-hidden>
      <Image
        src={LIBRARY_ART.background}
        alt=""
        fill
        className={styles.ambientBase}
        priority
        sizes="100vw"
      />
      <div className={styles.ambientScrim} />
    </div>
  );
}
