"use client";

import { ArrowLeft, Clock, FileText, FileType } from "lucide-react";

import {
  LIBRARY_WINGS,
  type LibraryNovel,
  type LibraryWingId,
} from "@/lib/library/library-catalog";
import { LIBRARY_NOVEL_COVERS } from "@/lib/library/library-art";
import { LibraryCoverImage, resolveLibraryCoverSrc } from "./library-cover-image";

import { LibrarySceneBackground } from "./library-scene-background";
import styles from "./library-scene.module.css";

const WING_LABEL: Record<LibraryWingId, string> = {
  allen_girls: "Allen Girls",
  licensed: "Licensed",
};

type Props = {
  novels: LibraryNovel[];
  activeWing: LibraryWingId | "all";
  onWingChange: (wing: LibraryWingId | "all") => void;
  onBack: () => void;
  onOpenNovel: (novel: LibraryNovel, mode?: "text" | "pdf") => void;
};

export function LibraryShelfScene({
  novels,
  activeWing,
  onWingChange,
  onBack,
  onOpenNovel,
}: Props) {
  const books =
    activeWing === "all" ? novels : novels.filter((n) => n.wing === activeWing);

  const wingTitle =
    activeWing === "all"
      ? "All Stories"
      : (LIBRARY_WINGS.find((w) => w.id === activeWing)?.title ?? "Stories");

  return (
    <div className={styles.shelf}>
      <LibrarySceneBackground dim="light" />

      <header className={styles.shelfTop}>
        <button type="button" className={styles.shelfBack} onClick={onBack}>
          <ArrowLeft size={16} aria-hidden />
          Labyrinth Map
        </button>
        <h1 className={styles.shelfTitle}>{wingTitle}</h1>
        <span className={styles.shelfCount}>{books.length} books</span>
      </header>

      <div className={styles.collectionPanel}>
        <div className={styles.wingTabs} role="tablist" aria-label="Book wings">
          <button
            type="button"
            role="tab"
            aria-selected={activeWing === "all"}
            className={`${styles.wingTab}${activeWing === "all" ? ` ${styles.wingTabOn}` : ""}`}
            onClick={() => onWingChange("all")}
          >
            All
          </button>
          {LIBRARY_WINGS.map((w) => (
            <button
              key={w.id}
              type="button"
              role="tab"
              aria-selected={activeWing === w.id}
              className={`${styles.wingTab}${activeWing === w.id ? ` ${styles.wingTabOn}` : ""}`}
              onClick={() => onWingChange(w.id)}
            >
              {w.id === "allen_girls" ? "Allen Girls" : "Licensed"}
            </button>
          ))}
        </div>

        <ul className={styles.bookCells}>
          {books.map((novel) => {
            const cover = resolveLibraryCoverSrc(novel.id, novel.coverUrl, LIBRARY_NOVEL_COVERS);
            return (
              <li key={novel.id} className={styles.bookCell}>
                <button
                  type="button"
                  className={styles.bookSlot}
                  onClick={() => onOpenNovel(novel, "text")}
                >
                  <div className={styles.slotFrame}>
                    {novel.tier === "vip" ? (
                      <span className={styles.slotVip} aria-label="VIP story">
                        VIP
                      </span>
                    ) : null}
                    {cover ? (
                      <LibraryCoverImage
                        src={cover}
                        alt={novel.title}
                        className={styles.slotCover}
                      />
                    ) : (
                      <span className={styles.slotFallback}>
                        {novel.title.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className={styles.slotTag}>{WING_LABEL[novel.wing]}</span>
                  <span className={styles.slotTitle}>{novel.title}</span>
                  <span className={styles.slotMeta}>
                    <Clock size={11} aria-hidden />
                    {novel.readMinutes} min
                  </span>
                </button>

                <div className={styles.slotActions}>
                  <button
                    type="button"
                    className={styles.slotBtn}
                    onClick={() => onOpenNovel(novel, "text")}
                  >
                    <FileText size={12} aria-hidden />
                    Read
                  </button>
                  <button
                    type="button"
                    className={styles.slotBtn}
                    onClick={() => onOpenNovel(novel, "pdf")}
                  >
                    <FileType size={12} aria-hidden />
                    PDF
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
