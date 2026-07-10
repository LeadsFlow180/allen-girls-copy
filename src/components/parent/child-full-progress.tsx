"use client";

import { useState } from "react";
import { Flame, MapPin, Presentation, Target, Trophy, Zap } from "lucide-react";

import { QUESTS_CATALOG } from "@/lib/learn/quests-catalog";
import type { ParentDashboardChildExtended } from "@/lib/parent/parent-dashboard-types";
import {
  formatQuizActivityLabel,
  formatSlideActivityLabel,
  formatSlideStatus,
  isSlideMissionComplete,
} from "@/lib/parent/parent-progress-labels";

import styles from "./child-full-progress.module.css";

const QUEST_TITLE_BY_ID = Object.fromEntries(QUESTS_CATALOG.map((q) => [q.id, q.title]));

type SagaTab = "slides" | "quizzes" | "quests" | "missions";

const TABS: { id: SagaTab; label: string; Icon: typeof Presentation }[] = [
  { id: "slides", label: "Slides", Icon: Presentation },
  { id: "quizzes", label: "Quizzes", Icon: Target },
  { id: "quests", label: "Quests", Icon: Zap },
  { id: "missions", label: "Missions", Icon: Trophy },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Props = {
  progress: ParentDashboardChildExtended;
};

export function ChildFullProgress({ progress }: Props) {
  const { summary } = progress;
  const [tab, setTab] = useState<SagaTab>("slides");

  const tabCounts: Record<SagaTab, number> = {
    slides: progress.slides.length,
    quizzes: progress.quizzes.length,
    quests: progress.questDays.reduce(
      (n, d) => n + d.claimedDaily.length + d.claimedWeekly.length + d.claimedMonthly.length,
      0,
    ),
    missions: progress.missions.length + progress.modulesCompleted.length,
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.heading}>Activity log</h3>
          <p className={styles.subhead}>Cloud-synced sessions and achievements</p>
        </div>
        <dl className={styles.summaryGrid}>
          {summary.latestSlideScene != null && summary.latestSlideTotal != null ? (
            <div className={styles.summaryItem}>
              <dt>Latest slide</dt>
              <dd>
                {summary.latestSlideScene}/{summary.latestSlideTotal}
              </dd>
            </div>
          ) : null}
          <div className={styles.summaryItem}>
            <dt>Missions</dt>
            <dd>
              {summary.missionsCompleted}/5
            </dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>Quests</dt>
            <dd>{summary.questsClaimedTotal}</dd>
          </div>
          <div className={styles.summaryItem}>
            <dt>Skills</dt>
            <dd>{summary.skillsPassed}</dd>
          </div>
          {progress.streak && progress.streak.current > 0 && (
            <div className={styles.summaryItem}>
              <dt>Streak</dt>
              <dd className={styles.summaryStreak}>
                <Flame size={12} strokeWidth={2.5} aria-hidden />
                {progress.streak.current}d
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className={styles.tabBar} role="tablist" aria-label="Activity categories">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={14} strokeWidth={2.25} aria-hidden />
            {t.label}
            <span className={styles.tabCount}>{tabCounts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className={styles.tabPanel} role="tabpanel">
        {tab === "slides" && (
          <>
            {progress.slides.length === 0 ? (
              <p className={styles.empty}>No slide progress saved to the cloud yet.</p>
            ) : (
              <ul className={styles.activityList}>
                {progress.slides.slice(0, 10).map((s) => (
                  <li
                    key={`${s.classroomId}-${s.sectionId ?? "s"}-${s.unitIndex ?? "u"}-${s.ladderStep ?? "step"}-${s.sceneIndex}-${s.updatedAt}`}
                    className={styles.activityItem}
                  >
                    <p className={styles.activityTitle}>
                      {formatSlideActivityLabel(s, {
                        sectionId: s.sectionId,
                        unitIndex: s.unitIndex,
                        ladderStep: s.ladderStep,
                        ladderStepIndex: s.ladderStepIndex,
                      })}
                    </p>
                    <div className={styles.activityMeta}>
                      <span
                        className={
                          isSlideMissionComplete(s) ? styles.badgeOk : styles.badgeProgress
                        }
                      >
                        {formatSlideStatus(s)}
                      </span>
                      <time className={styles.activityTime}>{formatDate(s.updatedAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "quizzes" && (
          <>
            {progress.quizzes.length === 0 ? (
              <p className={styles.empty}>No quiz submissions yet.</p>
            ) : (
              <ul className={styles.activityList}>
                {progress.quizzes.slice(0, 10).map((q, i) => (
                  <li key={`${q.submittedAt}-${i}`} className={styles.activityItem}>
                    <p className={styles.activityTitle}>{formatQuizActivityLabel(q)}</p>
                    <div className={styles.activityMeta}>
                      <span className={styles.badgeQuiz}>Quiz</span>
                      <time className={styles.activityTime}>{formatDate(q.submittedAt)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "quests" && (
          <>
            {progress.questDays.length === 0 ? (
              <p className={styles.empty}>
                No quest claims in the cloud yet. Quests sync when your child plays while signed in.
              </p>
            ) : (
              <ul className={styles.activityList}>
                {progress.questDays.slice(0, 8).map((day) => {
                  const all = [
                    ...day.claimedDaily.map((id) => ({ id, period: "Daily" })),
                    ...day.claimedWeekly.map((id) => ({ id, period: "Weekly" })),
                    ...day.claimedMonthly.map((id) => ({ id, period: "Monthly" })),
                  ];
                  if (all.length === 0) return null;
                  return (
                    <li key={day.questDate} className={styles.activityItem}>
                      <p className={styles.activityTitle}>{day.questDate}</p>
                      <div className={styles.chipWrap}>
                        {all.map((c) => (
                          <span key={c.id} className={styles.badgeProgress}>
                            {QUEST_TITLE_BY_ID[c.id] ?? c.id}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {tab === "missions" && (
          <>
            {progress.missions.length === 0 && progress.modulesCompleted.length === 0 ? (
              <p className={styles.empty}>No mission completions recorded yet.</p>
            ) : (
              <ul className={styles.activityList}>
                {progress.modulesCompleted.slice(0, 6).map((m) => (
                  <li key={`${m.moduleId}-${m.completedAt}`} className={styles.activityItem}>
                    <p className={styles.activityTitle}>
                      Module cleared · {m.worldSlug} / {m.moduleId}
                    </p>
                    <div className={styles.activityMeta}>
                      <span className={styles.badgeOk}>{m.skillsCount} skills</span>
                      <time className={styles.activityTime}>{formatDate(m.completedAt)}</time>
                    </div>
                  </li>
                ))}
                {progress.missions.slice(0, 8).map((m, i) => (
                  <li key={`${m.skillId}-${i}`} className={styles.activityItem}>
                    <p className={styles.activityTitle}>
                      {m.gateType} · {m.skillId}
                    </p>
                    <div className={styles.activityMeta}>
                      <span className={styles.badgeQuiz}>{m.subjectCategory}</span>
                      <span className={styles.activityTime}>
                        {m.score}% · {formatDate(m.completedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "slides" && progress.checkpoints.length > 0 && (
          <div className={styles.checkpointBlock}>
            <p className={styles.checkpointTitle}>
              <MapPin size={13} strokeWidth={2.25} aria-hidden />
              Checkpoints
            </p>
            <ul className={styles.activityList}>
              {progress.checkpoints.slice(0, 5).map((c, i) => (
                <li key={`${c.missionId}-${i}`} className={styles.activityItem}>
                  <p className={styles.activityTitle}>
                    {c.missionId} · {c.checkpointType.replace(/_/g, " ")}
                  </p>
                  <time className={styles.activityTime}>{formatDate(c.createdAt)}</time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
