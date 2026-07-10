"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Flame,
  Hash,
  MapPin,
  Presentation,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";

import { ChildFullProgress } from "@/components/parent/child-full-progress";
import type { ParentDashboardChild } from "@/lib/parent/parent-dashboard-types";

import family from "../family.module.css";
import styles from "./dashboard.module.css";

type ChildData = ParentDashboardChild;

const PARENT_DASHBOARD_POLL_MS = 8_000;

const TIER_LABELS: Record<string, string> = {
  emerging: "Building foundations",
  on_track: "On track",
  stretch: "Stretch level",
};

const DOMAIN_COLORS: Record<string, string> = {
  ela: "#7c3aed",
  math: "#0ea5e9",
};

const EVENT_LABELS: Record<string, string> = {
  gate_pass_crisis: "Passed a challenge",
  gate_pass_discovery: "Solved a discovery",
  placement_complete: "Finished placement",
  daily_login: "Daily login",
  streak_milestone: "Streak milestone",
  first_time_bonus: "First-time bonus",
  clean_run_bonus: "Clean run bonus",
  redeem: "Spent in store",
};

function PercentBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className={styles.percentBar}>
      <div
        className={styles.percentFill}
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

type MetricDef = {
  key: string;
  Icon: typeof Presentation;
  label: string;
  value: string;
};

function buildMetrics(child: ChildData): MetricDef[] {
  const summary = child.progress.summary;
  const hasLearnCloud =
    summary.slideSessions > 0 || summary.quizCount > 0 || summary.questsClaimedTotal > 0;

  const slideProgressValue =
    summary.latestSlideScene != null && summary.latestSlideTotal != null
      ? `${summary.latestSlideScene}/${summary.latestSlideTotal}`
      : "—";

  return [
    {
      key: "slides",
      Icon: Presentation,
      label: "Slides",
      value: slideProgressValue,
    },
    {
      key: "missions",
      Icon: Target,
      label: "Missions",
      value:
        summary.missionsCompleted > 0 || summary.missionsInProgress > 0
          ? `${summary.missionsCompleted}/5`
          : "—",
    },
    {
      key: "quiz",
      Icon: BookOpen,
      label: "Quiz avg",
      value:
        summary.avgQuizPercent != null
          ? `${summary.avgQuizPercent}%`
          : summary.quizCount > 0
            ? `${summary.quizCount}`
            : "—",
    },
    {
      key: "points",
      Icon: Star,
      label: "Points",
      value:
        child.points != null ? child.points.balance.toLocaleString() : hasLearnCloud ? "0" : "—",
    },
    {
      key: "butterflies",
      Icon: Sparkles,
      label: "Sanctuary",
      value: `${child.butterflies.length}`,
    },
  ];
}

function collapsedSummary(child: ChildData): string {
  const summary = child.progress.summary;
  const parts: string[] = [];

  if (summary.latestSlideScene != null && summary.latestSlideTotal != null) {
    parts.push(`Slide ${summary.latestSlideScene}/${summary.latestSlideTotal}`);
  }
  if (summary.missionsCompleted > 0 || summary.missionsInProgress > 0) {
    parts.push(`${summary.missionsCompleted}/5 missions`);
  }
  if (summary.avgQuizPercent != null) {
    parts.push(`${summary.avgQuizPercent}% quiz`);
  }

  return parts.length > 0 ? parts.join(" · ") : "No activity recorded yet";
}

function ChildCard({ child, defaultOpen }: { child: ChildData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const elaTier = child.domainTiers.find((d) => d.domain === "ela");
  const mathTier = child.domainTiers.find((d) => d.domain === "math");
  const metrics = buildMetrics(child);

  return (
    <article className={styles.childCard}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${styles.headerBtn} ${!open ? styles.headerBtnClosed : ""}`}
        aria-expanded={open}
      >
        <div className={styles.headerInner}>
          <span className={styles.avatar} aria-hidden>
            {child.displayName.charAt(0).toUpperCase()}
          </span>
          <div className={styles.headerMeta}>
            <div className={styles.headerTitleRow}>
              <p className={styles.childName}>{child.displayName}</p>
              <span
                className={
                  child.placement ? styles.statusBadgeReady : styles.statusBadgePending
                }
              >
                {child.placement
                  ? `${child.placement.overallPercent}% · ${TIER_LABELS[child.placement.tier] ?? child.placement.tier}`
                  : "Placement pending"}
              </span>
            </div>
            {!open && <p className={styles.collapsedSummary}>{collapsedSummary(child)}</p>}
          </div>
        </div>
        <span className={styles.chevronBtn} aria-hidden>
          {open ? <ChevronUp size={16} strokeWidth={2.25} /> : <ChevronDown size={16} strokeWidth={2.25} />}
        </span>
      </button>

      {open && (
        <div className={styles.body}>
          {!child.placement && (
            <div className={styles.placementWarn}>
              <span className={styles.placementIconWrap} aria-hidden>
                <Compass size={18} strokeWidth={2.25} />
              </span>
              <div>
                <p className={styles.placementTitle}>Start placement to unlock levels</p>
                <p className={styles.placementText}>
                  Have <strong>{child.displayName}</strong> sign in as the learner (not this guardian
                  account), open <strong>Learn</strong>, and begin the placement adventure.
                </p>
              </div>
            </div>
          )}

          <div className={styles.metricStrip}>
            {metrics.map((m) => (
              <div key={m.key} className={styles.metricCard}>
                <span className={styles.metricIconWrap} aria-hidden>
                  <m.Icon size={15} strokeWidth={2.25} />
                </span>
                <p className={styles.metricLabel}>{m.label}</p>
                <p className={styles.metricValue}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.insightsPanel}>
              {(elaTier || mathTier) && (
                <section className={styles.insightSection}>
                  <p className={styles.panelTitle}>Domain levels</p>
                  <div className={styles.domainCards}>
                    {elaTier && (
                      <div className={styles.domainCard}>
                        <div className={styles.domainCardHead}>
                          <BookOpen size={14} strokeWidth={2.25} color="#7c3aed" aria-hidden />
                          <span>ELA</span>
                          <strong>{elaTier.percent}%</strong>
                        </div>
                        <PercentBar pct={elaTier.percent} color={DOMAIN_COLORS.ela} />
                        <span className={styles.domainTier}>
                          {TIER_LABELS[elaTier.tier] ?? elaTier.tier}
                        </span>
                      </div>
                    )}
                    {mathTier && (
                      <div className={styles.domainCard}>
                        <div className={styles.domainCardHead}>
                          <Hash size={14} strokeWidth={2.25} color="#0ea5e9" aria-hidden />
                          <span>Math</span>
                          <strong>{mathTier.percent}%</strong>
                        </div>
                        <PercentBar pct={mathTier.percent} color={DOMAIN_COLORS.math} />
                        <span className={styles.domainTier}>
                          {TIER_LABELS[mathTier.tier] ?? mathTier.tier}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {child.learningPath && (
                <section className={styles.insightSection}>
                  <p className={styles.pathTitle}>
                    <MapPin size={14} strokeWidth={2.25} aria-hidden />
                    Current path
                  </p>
                  <p className={styles.pathText}>
                    <strong>
                      {child.learningPath.focusDomain === "math" ? "Math & STEM" : "Reading & Language"}
                    </strong>
                    <span className={styles.pathDivider}>·</span>
                    World <strong>{child.learningPath.recommendedWorldSlug}</strong>
                  </p>
                  {child.learningPath.nextSkillIds.length > 0 && (
                    <p className={styles.pathNext}>
                      Up next: {child.learningPath.nextSkillIds.slice(0, 3).join(", ")}
                    </p>
                  )}
                </section>
              )}

              {child.butterflies.length > 0 && (
                <section className={styles.insightSection}>
                  <p className={styles.panelTitle}>Sanctuary</p>
                  <div className={styles.chipRow}>
                    {child.butterflies.map((b) => (
                      <span key={b.speciesKey} className={styles.butterflyChip}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {child.recentActivity.length > 0 && (
                <section className={styles.insightSection}>
                  <p className={styles.panelTitle}>Recent rewards</p>
                  {child.recentActivity.slice(0, 5).map((act, i) => (
                    <div key={i} className={styles.activityRow}>
                      <span className={styles.activityLabel}>
                        {EVENT_LABELS[act.eventType] ?? act.eventType}
                      </span>
                      <span
                        className={act.amount >= 0 ? styles.activityPtsPos : styles.activityPtsNeg}
                      >
                        {act.amount >= 0 ? `+${act.amount}` : act.amount}
                      </span>
                    </div>
                  ))}
                </section>
              )}

              {child.progress.streak && child.progress.streak.current > 0 && (
                <section className={styles.insightSection}>
                  <div className={styles.streakPill}>
                    <Flame size={14} strokeWidth={2.25} aria-hidden />
                    <span>{child.progress.streak.current}-day streak</span>
                  </div>
                </section>
              )}
            </div>

            <div className={styles.sagaColumn}>
              <ChildFullProgress progress={child.progress} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/parent/dashboard", {
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) {
          setError("Please sign in to your guardian account.");
          return;
        }
        if (res.status === 403) {
          setError("This dashboard is for guardian accounts only.");
          return;
        }
        if (!res.ok) {
          setError("Could not load progress data.");
          return;
        }
        const json = (await res.json()) as { children: ChildData[] };
        if (cancelled) return;
        setError(null);
        setChildren(json.children);
      } catch {
        if (!cancelled) setError("Something went wrong loading the dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    const reload = () => {
      void load();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };

    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, PARENT_DASHBOARD_POLL_MS);

    window.addEventListener("focus", reload);
    window.addEventListener("pageshow", reload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      window.removeEventListener("focus", reload);
      window.removeEventListener("pageshow", reload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section className={family.familyScreen} aria-labelledby="progress-dashboard-title">
      <header className={family.screenHead}>
        <div className={family.screenHeadCopy}>
          <h1 id="progress-dashboard-title" className={family.screenTitle}>
            Progress dashboard
          </h1>
          <p className={family.screenLead}>
            {loading
              ? "Loading learner activity…"
              : error
                ? "Unable to load progress right now."
                : children.length === 0
                  ? "Add learners from Family to start tracking progress."
                  : `${children.length} learner${children.length === 1 ? "" : "s"} · refreshes every 8 seconds`}
          </p>
        </div>
        {!loading && !error && children.length > 0 && (
          <span className={styles.liveBadge} aria-live="polite">
            Live
          </span>
        )}
      </header>

      {loading && (
        <div className={styles.skeletonStack} aria-hidden>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      )}

      {error && <p className={family.error}>{error}</p>}

      {!loading && !error && children.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIconWrap} aria-hidden>
            <Users size={22} strokeWidth={2} />
          </span>
          <p className={styles.emptyTitle}>No learners yet</p>
          <p className={styles.emptyText}>
            Add a learner from Family profiles, then have them sign in and play to see activity here.
          </p>
          <Link href="/parent/children" className={family.primaryBtn}>
            Family profiles
          </Link>
        </div>
      )}

      {!loading && !error && children.length > 0 && (
        <div className={styles.rosterPanel}>
          <div className={styles.rosterPanelHead}>
            <p className={styles.rosterPanelTitle}>Learner progress</p>
            <p className={styles.rosterPanelHint}>Expand a row for full metrics and activity</p>
          </div>
          <div className={styles.learnerStack}>
            {children.map((child, index) => (
              <ChildCard key={child.userId} child={child} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
