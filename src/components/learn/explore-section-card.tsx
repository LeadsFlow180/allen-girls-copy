"use client";

import Image from "next/image";
import { Check, Lock } from "lucide-react";

import styles from "./explore-section-card.module.css";

export type SectionCardStatus = "current" | "complete" | "upcoming" | "locked";

export interface ExploreSectionCardProps {
  sectionId: number;
  title: string;
  bubble: string;
  description: string;
  icon: import("next/image").StaticImageData | string;
  progress: number;
  /** e.g. "6% of section (10 units)" — defaults to "{progress}% complete" */
  progressLabel?: string;
  status: SectionCardStatus;
  onContinue: () => void;
}

export function ExploreSectionCard({
  sectionId,
  title,
  bubble,
  description,
  icon,
  progress,
  progressLabel,
  status,
  onContinue,
}: ExploreSectionCardProps) {
  const isCurrent = status === "current";
  const isComplete = status === "complete";
  const isLocked = status === "locked";

  const statusLabel =
    isCurrent ? "In progress" : isComplete ? "Completed" : isLocked ? "Locked" : "Up next";

  return (
    <article
      className={`${styles.card} font-nunito ${isCurrent ? styles.cardCurrent : ""} ${isLocked ? styles.cardLocked : ""}`}
      data-locked={isLocked}
    >
      <div
        className={`${styles.accentBar} ${isCurrent ? styles.accentBarCurrent : ""} ${isComplete ? styles.accentBarComplete : ""}`}
        aria-hidden
      />

      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.metaRow}>
            <span className={styles.levelBadge}>A1 · Part {sectionId}</span>
            <span
              className={`${styles.statusPill} ${
                isCurrent
                  ? styles.statusCurrent
                  : isComplete
                    ? styles.statusComplete
                    : isLocked
                      ? styles.statusLocked
                      : ""
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <h2 className={styles.title}>{title}</h2>
          <p className={styles.desc}>{description}</p>

          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {progressLabel ?? `${progress}% complete`}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              disabled={isLocked}
              className={`${styles.ctaPrimary} ${
                isLocked
                  ? styles.ctaLocked
                  : isCurrent || isComplete
                    ? styles.ctaGreen
                    : styles.ctaChip
              }`}
              onClick={onContinue}
            >
              {isLocked ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Lock size={16} strokeWidth={2.5} />
                  Locked
                </span>
              ) : isCurrent ? (
                "Continue"
              ) : isComplete ? (
                "Review"
              ) : (
                "Start"
              )}
            </button>
          </div>
        </div>

        <aside
          className={`${styles.preview} ${isCurrent ? styles.previewCurrent : ""}`}
          aria-label="Preview phrase"
        >
          <p
            className={`${styles.bubble} ${isCurrent ? styles.bubbleCurrent : ""}`}
            lang="es"
          >
            {bubble}
          </p>
          <div
            className={`${styles.iconRing} ${
              isLocked
                ? styles.iconRingLocked
                : isCurrent || isComplete
                  ? styles.iconRingCurrent
                  : styles.iconRingDefault
            }`}
          >
            {isComplete ? (
              <Check size={26} color="#fff" strokeWidth={3} />
            ) : (
              <Image
                src={icon}
                alt=""
                width={26}
                height={26}
                style={{
                  opacity: isLocked ? 0.45 : 1,
                  filter: isCurrent || isComplete ? "brightness(0) invert(1)" : "none",
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
