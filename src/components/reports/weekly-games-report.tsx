"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileBarChart2, RefreshCw } from "lucide-react";

import type { WeeklyGamesReport } from "@/lib/games/build-weekly-report";
import { formatPlayMinutes, weeklyReportToCsv } from "@/lib/games/build-weekly-report";

import styles from "./weekly-games-report.module.css";

type Props = {
  /** API path without query, e.g. /api/parent/reports */
  apiPath: string;
  /** Parent vs teacher copy */
  audience: "parent" | "teacher";
  emptyHint: string;
};

type DaysOption = 7 | 14 | 30;

export function WeeklyGamesReportPanel({ apiPath, audience, emptyHint }: Props) {
  const [days, setDays] = useState<DaysOption>(7);
  const [report, setReport] = useState<WeeklyGamesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiPath}?days=${days}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Could not load report (${res.status})`);
      }
      const data = (await res.json()) as { report: WeeklyGamesReport };
      setReport(data.report);
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : "Could not load report");
    } finally {
      setLoading(false);
    }
  }, [apiPath, days]);

  useEffect(() => {
    void load();
  }, [load]);

  const downloadCsv = () => {
    if (!report) return;
    const csv = weeklyReportToCsv(report);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aga-games-report-${audience}-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sinceLabel = report
    ? new Date(report.since).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.eyebrow}>
            <FileBarChart2 size={14} aria-hidden /> Reports
          </p>
          <h1 className={styles.title}>Games report</h1>
          <p className={styles.lead}>
            Live summary from game play — sessions, questions, accuracy, and points
            {sinceLabel ? ` since ${sinceLabel}` : ""}.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.dayToggle} role="group" aria-label="Report range">
            {([7, 14, 30] as DaysOption[]).map((d) => (
              <button
                key={d}
                type="button"
                className={days === d ? styles.dayActive : styles.dayBtn}
                onClick={() => setDays(d)}
              >
                {d} days
              </button>
            ))}
          </div>
          <button type="button" className={styles.secondaryBtn} onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={downloadCsv}
            disabled={!report || report.learners.length === 0}
          >
            <Download size={15} aria-hidden />
            Download CSV
          </button>
        </div>
      </header>

      {loading && (
        <p className={styles.status}>Loading report…</p>
      )}

      {error && !loading && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && report && (
        <>
          <div className={styles.statGrid}>
            <Stat label="Sessions" value={String(report.totals.sessions)} />
            <Stat label="Time played" value={formatPlayMinutes(report.totals.playSeconds)} />
            <Stat
              label="Questions"
              value={
                report.totals.questionsAsked > 0
                  ? `${report.totals.questionsCorrect}/${report.totals.questionsAsked}`
                  : "0"
              }
            />
            <Stat
              label="Accuracy"
              value={
                report.totals.accuracyPercent != null ? `${report.totals.accuracyPercent}%` : "—"
              }
            />
            <Stat label="Game points" value={String(report.totals.gamePoints)} />
          </div>

          {report.learners.length === 0 ? (
            <p className={styles.empty}>{emptyHint}</p>
          ) : report.totals.sessions === 0 ? (
            <p className={styles.empty}>
              No game activity in the last {days} days yet. When learners play while signed in,
              their results will show here.
            </p>
          ) : null}

          {report.learners.length > 0 && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Sessions</th>
                    <th>Time</th>
                    <th>Questions</th>
                    <th>Accuracy</th>
                    <th>Points</th>
                    <th>Top game</th>
                    <th>Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {report.learners.map((l) => (
                    <tr key={l.studentId}>
                      <td className={styles.nameCell}>{l.displayName}</td>
                      <td>{l.sessions}</td>
                      <td>{formatPlayMinutes(l.playSeconds)}</td>
                      <td>
                        {l.questionsAsked > 0
                          ? `${l.questionsCorrect}/${l.questionsAsked}`
                          : "—"}
                      </td>
                      <td>{l.accuracyPercent != null ? `${l.accuracyPercent}%` : "—"}</td>
                      <td>{l.gamePoints}</td>
                      <td>{l.topGame ?? "—"}</td>
                      <td className={styles.skillCell}>
                        {l.strongestSkill || l.weakestSkill ? (
                          <>
                            {l.strongestSkill && <span>Strong: {l.strongestSkill}</span>}
                            {l.weakestSkill &&
                              l.weakestSkill !== l.strongestSkill && (
                                <span>Work on: {l.weakestSkill}</span>
                              )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
