"use client";

import styles from "./library-reading-surface.module.css";

/** Plain white backdrop while a story is open — keeps focus on the book. */
export function LibraryReadingSurface() {
  return <div className={styles.surface} aria-hidden />;
}
