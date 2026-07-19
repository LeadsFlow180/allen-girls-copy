"use client";

import styles from "./library-reading-surface.module.css";

/**
 * Calm reading backdrop — wooden table + soft room light.
 * Used while a story is open so the busy Library Labyrinth art
 * does not compete with book text and illustrations.
 */
export function LibraryReadingSurface() {
  return (
    <div className={styles.surface} aria-hidden>
      <div className={styles.room} />
      <div className={styles.table} />
      <div className={styles.tableEdge} />
      <div className={styles.lampGlow} />
      <div className={styles.vignette} />
    </div>
  );
}
