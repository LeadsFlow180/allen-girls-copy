"use client";

import { useEffect, useState } from "react";

import type { ParentChildListItem } from "@/app/api/parent/children/route";

import guardian from "./guardian-family-controls.module.css";

export function GuardianHomeStats() {
  const [learnerCount, setLearnerCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFamilySummary() {
      try {
        const res = await fetch("/api/parent/children", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { children: ParentChildListItem[] };
        const children = data.children ?? [];
        if (cancelled) return;
        setLearnerCount(children.length);
        setPendingCount(children.filter((child) => !child.isApproved).length);
      } catch {
        if (!cancelled) setLearnerCount(null);
      }
    }

    void loadFamilySummary();
    return () => {
      cancelled = true;
    };
  }, []);

  if (learnerCount === null) {
    return null;
  }

  return (
    <div className={guardian.statStrip} aria-label="Family summary">
      <div className={guardian.statTile}>
        <span className={guardian.statValue}>{learnerCount}</span>
        <span className={guardian.statLabel}>
          Learner{learnerCount === 1 ? "" : "s"} linked
        </span>
      </div>
      <div className={guardian.statTile}>
        <span className={guardian.statValue}>{pendingCount}</span>
        <span className={guardian.statLabel}>Pending approval</span>
      </div>
    </div>
  );
}
