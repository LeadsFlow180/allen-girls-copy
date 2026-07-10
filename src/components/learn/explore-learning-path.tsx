"use client";

import Image from "next/image";
import { Map } from "lucide-react";
import {
  ExploreSectionCard,
  type ExploreSectionCardProps,
  type SectionCardStatus,
} from "@/components/learn/explore-section-card";

import exploreGameBg from "@/assets/images/learn/explore-game-background.png";

import styles from "./explore-learning-path.module.css";

export type LearningPathSection = {
  id: number;
  title: string;
  bubble: string;
  description: string;
  icon: ExploreSectionCardProps["icon"];
  progress: number;
  unitsInSection?: number;
};

export type ExploreLearningPathProps = {
  sections: LearningPathSection[];
  activeSectionId: number;
  onSectionContinue: (sectionId: number) => void;
  /** When set, clarifies this map is the signed-in learner only (not a parent view). */
  learnerScopeLabel?: string | null;
};

const STAR_SPOTS = [
  { top: "12%", left: "8%" },
  { top: "20%", left: "72%" },
  { top: "35%", left: "18%" },
  { top: "48%", left: "85%" },
  { top: "62%", left: "12%" },
];

function sectionStatus(
  section: LearningPathSection,
  activeSectionId: number,
): SectionCardStatus {
  if (section.progress >= 100) return "complete";
  if (section.id === activeSectionId) return "current";
  if (section.id > activeSectionId) return "locked";
  return "upcoming";
}

function TimelineNode({
  sectionId,
  status,
}: {
  sectionId: number;
  status: SectionCardStatus;
}) {
  const className = [
    styles.timelineNode,
    status === "current" && styles.nodeCurrent,
    status === "complete" && styles.nodeComplete,
    status === "locked" && styles.nodeLocked,
    status === "upcoming" && styles.nodeUpcoming,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-hidden>
      {status === "complete" ? (
        <span style={{ fontSize: "1rem" }}>✓</span>
      ) : (
        sectionId
      )}
    </div>
  );
}

function PathWorldBackdrop() {
  return (
    <div className={styles.skyDecor} aria-hidden>
      <Image
        src={exploreGameBg}
        alt=""
        fill
        className={styles.worldBg}
        sizes="(max-width: 768px) 100vw, 720px"
        priority
      />
      <div className={styles.worldOverlay} />
      <div className={styles.sun} />
      <div className={`${styles.cloud} ${styles.cloudA}`} />
      <div className={`${styles.cloud} ${styles.cloudB}`} />
      <div className={`${styles.cloud} ${styles.cloudC}`} />
      {STAR_SPOTS.map((spot, i) => (
        <span
          key={i}
          className={styles.star}
          style={{ ...spot, animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <div className={styles.hillBack} />
      <div className={styles.hillFront} />
    </div>
  );
}

export function ExploreLearningPath({
  sections,
  activeSectionId,
  onSectionContinue,
  learnerScopeLabel,
}: ExploreLearningPathProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.pathWorld}>
        <PathWorldBackdrop />

        <div className={styles.pathContent}>
          <header className={styles.hero}>
            <span className={styles.heroRope} aria-hidden />
            <p className={`${styles.heroBadge} font-nunito`}>
              <Map size={14} strokeWidth={2.5} aria-hidden />
              Spanish · A1
            </p>
            <h1 className={`${styles.heroTitle} font-fredoka`}>
              Your learning path
            </h1>
            <p className={`${styles.heroDesc} font-nunito`}>
              {learnerScopeLabel ? (
                <>
                  <strong>{learnerScopeLabel}</strong> — this map only loads your
                  own saves. Parents see each child on{" "}
                  <span style={{ whiteSpace: "nowrap" }}>Progress intel</span>, not
                  here.
                </>
              ) : (
                <>
                  Pick a section, follow the zigzag missions, and earn XP — just like
                  your favorite language app.
                </>
              )}
            </p>
          </header>

          <ol className={styles.timeline} aria-label="Course sections">
            {sections.map((section, index) => {
              const status = sectionStatus(section, activeSectionId);
              const isLast = index === sections.length - 1;

              return (
                <li key={section.id} className={styles.timelineItem}>
                  <div className={styles.timelineRail}>
                    <TimelineNode sectionId={section.id} status={status} />
                    {!isLast && (
                      <div
                        className={`${styles.timelineLine} ${
                          status === "locked" ? styles.timelineLineMuted : ""
                        }`}
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className={styles.timelineCard}>
                    <ExploreSectionCard
                      sectionId={section.id}
                      title={section.title}
                      bubble={section.bubble}
                      description={section.description}
                      icon={section.icon}
                      progress={section.progress}
                      progressLabel={
                        section.unitsInSection
                          ? `${section.progress}% of section · ${section.unitsInSection} units`
                          : undefined
                      }
                      status={status}
                      onContinue={() => onSectionContinue(section.id)}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
