"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Clock,
  Headphones,
  Layers,
  Mic,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import {
  getCurriculumPreviewStats,
  getUnitCurriculumPreview,
  SLIDE_KIND_LABELS,
  type CurriculumSlideKind,
  type CurriculumSlidePreview,
  type UnitCurriculumPreview,
} from "@/lib/learn/unit-curriculum-preview";
import styles from "./explore-unit-curriculum-preview.module.css";

const KIND_STYLES: Record<
  CurriculumSlideKind,
  { bg: string; color: string; icon: typeof BookOpen }
> = {
  story: { bg: "#e0f2fe", color: "#0369a1", icon: BookOpen },
  vocab: { bg: "#dcfce7", color: "#15803d", icon: Layers },
  listen: { bg: "#fef3c7", color: "#b45309", icon: Headphones },
  speak: { bg: "#fce7f3", color: "#be185d", icon: Mic },
  practice: { bg: "#f3e8ff", color: "#6b21a8", icon: Target },
  quiz: { bg: "#ffe4e6", color: "#be123c", icon: Target },
  reward: { bg: "#ffedd5", color: "#c2410c", icon: Trophy },
};

export type ExploreUnitCurriculumPreviewProps = {
  open: boolean;
  onClose: () => void;
  sectionId: number;
  unitIndex: number;
  unitTitle: string;
  themeColor: string;
};

export function ExploreUnitCurriculumPreview({
  open,
  onClose,
  sectionId,
  unitIndex,
  unitTitle,
  themeColor,
}: ExploreUnitCurriculumPreviewProps) {
  const preview = useMemo(
    () =>
      getUnitCurriculumPreview({
        sectionId,
        unitIndex,
        unitTitle,
        themeColor,
      }),
    [sectionId, unitIndex, unitTitle, themeColor],
  );

  const [missionIndex, setMissionIndex] = useState(0);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMissionIndex(0);
    const first = preview.missions[0]?.slides[0];
    setActiveSlideId(first?.id ?? null);
  }, [open, preview]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const stats = getCurriculumPreviewStats(preview);
  const mission = preview.missions[missionIndex];
  const activeSlide =
    mission?.slides.find((s) => s.id === activeSlideId) ??
    mission?.slides[0] ??
    null;

  const missionAccent = mission?.accent ?? themeColor;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal
      aria-labelledby="unit-curriculum-title"
      onClick={onClose}
    >
      <div className={styles.shell} onClick={(e) => e.stopPropagation()}>
        <div
          className={styles.accentBar}
          style={{
            background: `linear-gradient(90deg, ${themeColor}, ${missionAccent})`,
          }}
          aria-hidden
        />

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              Section {sectionId} · Unit {unitIndex + 1} · Curriculum preview
            </p>
            <h2 id="unit-curriculum-title" className={styles.title}>
              {preview.headline}
            </h2>
            <p className={styles.subtitle}>{preview.description}</p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close curriculum preview"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>

        <div className={`${styles.scrollRegion} aga-scroll-panel`}>
          <StatsRow preview={preview} stats={stats} />

          <VocabStrip words={preview.vocabulary} />

          <div className={styles.body}>
          <div className={styles.missionTabs} role="tablist" aria-label="Missions">
            {preview.missions.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={i === missionIndex}
                className={`${styles.missionTab} ${
                  i === missionIndex ? styles.missionTabActive : ""
                }`}
                style={
                  {
                    "--mission-accent": m.accent,
                  } as CSSProperties
                }
                onClick={() => {
                  setMissionIndex(i);
                  setActiveSlideId(m.slides[0]?.id ?? null);
                }}
              >
                <span className={styles.missionTabNum}>{i + 1}</span>
                <span className={styles.missionTabLabel}>{m.title}</span>
              </button>
            ))}
          </div>

          {mission ? (
            <div
              className={styles.missionPanel}
              role="tabpanel"
              style={{ "--mission-accent": missionAccent } as CSSProperties}
            >
              <div className={styles.objectiveCard}>
                <p className={styles.objectiveLabel}>
                  {mission.subtitle} · Mission {mission.stepIndex + 1}
                </p>
                <p className={styles.objectiveText}>{mission.objective}</p>
              </div>

              <div className={styles.slideList}>
                {mission.slides.map((slide) => (
                  <SlideRow
                    key={slide.id}
                    slide={slide}
                    accent={missionAccent}
                    isActive={slide.id === activeSlide?.id}
                    onSelect={() => setActiveSlideId(slide.id)}
                  />
                ))}
              </div>

              {activeSlide ? (
                <div
                  className={styles.previewPane}
                  style={{ "--mission-accent": missionAccent } as CSSProperties}
                >
                  <p className={styles.previewPaneLabel}>Slide preview</p>
                  <p className={styles.previewPaneTitle}>{activeSlide.title}</p>
                  <p className={styles.previewPaneBody}>{activeSlide.summary}</p>
                  {activeSlide.sampleLine ? (
                    <p className={styles.previewPaneBody}>
                      <em>&ldquo;{activeSlide.sampleLine}&rdquo;</em>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.previewBadge}>
            <Sparkles size={12} aria-hidden />
            Preview only
          </span>
          <button type="button" className={styles.startBtn} onClick={onClose}>
            Close preview
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function StatsRow({
  preview,
  stats,
}: {
  preview: UnitCurriculumPreview;
  stats: ReturnType<typeof getCurriculumPreviewStats>;
}) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.missionCount}</span>
        <span className={styles.statLabel}>Missions</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.slideCount}</span>
        <span className={styles.statLabel}>Slides</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>
          <Clock size={12} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
          {stats.estimatedMinutes}m
        </span>
        <span className={styles.statLabel}>Est. time</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{preview.levelLabel}</span>
        <span className={styles.statLabel}>Level</span>
      </div>
    </div>
  );
}

function VocabStrip({ words }: { words: string[] }) {
  return (
    <div className={styles.vocabStrip}>
      <p className={styles.vocabLabel}>Key vocabulary in this unit</p>
      <div className={styles.vocabChips}>
        {words.map((w) => (
          <span key={w} className={styles.vocabChip}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function SlideRow({
  slide,
  accent,
  isActive,
  onSelect,
}: {
  slide: CurriculumSlidePreview;
  accent: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const kind = KIND_STYLES[slide.kind];
  const KindIcon = kind.icon;

  return (
    <button
      type="button"
      className={`${styles.slideCard} ${isActive ? styles.slideCardActive : ""}`}
      style={{ "--mission-accent": accent } as CSSProperties}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <span className={styles.slideOrder}>{slide.order}</span>
      <div className={styles.slideMain}>
        <div className={styles.slideTitleRow}>
          <p className={styles.slideTitle}>{slide.title}</p>
          <span
            className={styles.kindBadge}
            style={{ background: kind.bg, color: kind.color }}
          >
            <KindIcon
              size={10}
              style={{ display: "inline", verticalAlign: "-1px", marginRight: 2 }}
              aria-hidden
            />
            {SLIDE_KIND_LABELS[slide.kind]}
          </span>
        </div>
        <p className={styles.slideSummary}>{slide.summary}</p>
        {slide.sampleLine ? (
          <p className={styles.sampleLine}>&ldquo;{slide.sampleLine}&rdquo;</p>
        ) : null}
      </div>
      <span className={styles.slideDuration}>{slide.durationMin} min</span>
    </button>
  );
}
