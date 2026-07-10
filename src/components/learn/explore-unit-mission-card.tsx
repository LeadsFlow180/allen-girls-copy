"use client";

import { useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { BookOpen, Lock, Sparkles, Star, Zap } from "lucide-react";
import { ExploreUnitCurriculumPreview } from "@/components/learn/explore-unit-curriculum-preview";
import { ExploreUnitPlaygroundScene } from "@/components/learn/explore-unit-playground-scene";
import { ExploreQuizStats } from "@/components/learn/explore-quiz-stats";
import type { LearnQuizStats } from "@/lib/learn/quiz-stats";
import styles from "./explore-unit-view.module.css";

export type ExploreUnitMissionCardProps = {
  sectionId: number;
  unitIndex: number;
  unitTitle: string;
  themeColor: string;
  isCurrent: boolean;
  isCompleted: boolean;
  rewardLabel: string;
  statusLabel: string;
  quizStats?: LearnQuizStats | null;
  children: ReactNode;
};

export function ExploreUnitMissionCard({
  sectionId,
  unitIndex,
  unitTitle,
  themeColor,
  isCurrent,
  isCompleted,
  rewardLabel,
  statusLabel,
  quizStats = null,
  children,
}: ExploreUnitMissionCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isLocked = !isCurrent && !isCompleted;
  const unitNum = unitIndex + 1;

  const cardClass = [
    styles.unitCard,
    isCurrent ? styles.unitCardCurrent : "",
    isLocked ? styles.unitCardLocked : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bannerClass = [
    styles.unitBanner,
    isLocked ? styles.unitBannerLocked : "",
    isCurrent ? styles.unitBannerActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const playgroundClass = [
    styles.pathPlayground,
    isLocked ? styles.pathPlaygroundLocked : styles.pathPlaygroundLive,
  ]
    .filter(Boolean)
    .join(" ");

  const unitColorVar = { "--unit-color": themeColor } as CSSProperties;

  const stopBubble = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cardClass}
      style={{
        ...unitColorVar,
        border: isCurrent
          ? `2px solid ${themeColor}66`
          : "2px solid #e8e8e8",
      }}
    >
      <div
        className={`${styles.unitBg} ${isLocked ? styles.unitBgLocked : styles.unitBgCurrent}`}
        style={unitColorVar}
        aria-hidden
      >
        {!isLocked && (
          <>
            <span className={styles.unitBgBlob1} />
            <span className={styles.unitBgBlob2} />
            <span className={styles.unitBgBlob3} />
          </>
        )}
      </div>

      <header className={bannerClass} style={unitColorVar}>
        <div
          className={`${styles.unitNumBadge} font-fredoka`}
          style={
            isLocked
              ? undefined
              : {
                  background: `linear-gradient(145deg, ${themeColor}, color-mix(in srgb, ${themeColor} 75%, #000))`,
                  boxShadow: `0 3px 0 color-mix(in srgb, ${themeColor} 70%, #000)`,
                }
          }
          aria-hidden
        >
          {unitNum}
        </div>
        <div className={styles.unitMeta}>
          <p className={`${styles.unitEyebrow} font-nunito`}>
            Section {sectionId} · Unit {unitNum}
          </p>
          <h3 className={`${styles.unitTitle} font-fredoka`}>
            {unitTitle.startsWith("Unit ")
              ? unitTitle
              : `Unit ${unitNum} · ${unitTitle}`}
          </h3>
          <div
            className={`${styles.rewardPill} font-nunito ${
              isLocked ? styles.rewardPillLocked : styles.rewardPillLive
            }`}
          >
            {isLocked ? (
              <Lock size={12} strokeWidth={2.5} aria-hidden />
            ) : isCompleted ? (
              <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden />
            ) : (
              <Zap size={12} fill="currentColor" strokeWidth={0} aria-hidden />
            )}
            <span>{rewardLabel}</span>
            {!isLocked && <Sparkles size={11} className={styles.rewardSparkle} aria-hidden />}
          </div>
        </div>
        <div className={styles.unitBadges}>
          <button
            type="button"
            className={`${styles.previewCurriculumBtn} font-nunito`}
            onClick={(e) => {
              stopBubble(e);
              setPreviewOpen(true);
            }}
            aria-label={`Preview curriculum for unit ${unitNum}`}
          >
            <BookOpen size={13} strokeWidth={2.5} aria-hidden />
            Preview
          </button>
          {isCompleted && (
            <span
              className={styles.starBadge}
              style={{ background: themeColor }}
              aria-hidden
            >
              ★
            </span>
          )}
          {isCurrent && (
            <span className={styles.pulseDot} aria-hidden title="Active unit" />
          )}
          <span
            className={`${styles.statusBadge} font-nunito ${
              isCurrent
                ? styles.statusCurrent
                : isCompleted
                  ? styles.statusDone
                  : styles.statusLocked
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <div
        className={styles.pathMount}
        onClick={stopBubble}
        onKeyDown={stopBubble}
      >
        <div className={playgroundClass} style={unitColorVar}>
          <ExploreUnitPlaygroundScene
            sectionId={sectionId}
            themeColor={themeColor}
            isLocked={isLocked}
          />
        </div>
        <div className={styles.pathContent}>{children}</div>
      </div>

      {quizStats &&
      (quizStats.attemptsCount > 0 ||
        quizStats.lastQuiz ||
        quizStats.recentAttempts.length > 0) ? (
        <div
          className={styles.unitQuizStrip}
          onClick={stopBubble}
          onKeyDown={stopBubble}
        >
          <ExploreQuizStats stats={quizStats} />
        </div>
      ) : null}

      <ExploreUnitCurriculumPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sectionId={sectionId}
        unitIndex={unitIndex}
        unitTitle={unitTitle}
        themeColor={themeColor}
      />
    </div>
  );
}
