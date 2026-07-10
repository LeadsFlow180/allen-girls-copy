"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, UserRound } from "lucide-react";

import { LearnerProfileRow } from "@/components/parent/learner-profile-row";
import type { ParentChildListItem } from "@/app/api/parent/children/route";

import styles from "../family.module.css";

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ParentChildListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parent/children");
      if (!res.ok) {
        setError("Could not load family profiles.");
        return;
      }
      const data = (await res.json()) as { children: ParentChildListItem[] };
      setChildren(data.children ?? []);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verifiedCount = children.filter((child) => child.isApproved).length;

  return (
    <section className={styles.familyScreen} aria-labelledby="family-screen-title">
      <header className={styles.screenHead}>
        <div className={styles.screenHeadCopy}>
          <h1 id="family-screen-title" className={styles.screenTitle}>
            Family profiles
          </h1>
          <p className={styles.screenLead}>
            {loading
              ? "Loading learners…"
              : children.length === 0
                ? "Add a learner to get started."
                : `${children.length} learner${children.length === 1 ? "" : "s"} · ${verifiedCount} verified`}
          </p>
        </div>
        <Link href="/parent/children/new" className={styles.primaryBtn}>
          <Plus size={16} strokeWidth={2.5} aria-hidden />
          Add learner
        </Link>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.groupedList} aria-hidden>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
      ) : children.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIconWrap} aria-hidden>
            <UserRound size={22} strokeWidth={2} />
          </span>
          <p className={styles.emptyTitle}>No learners yet</p>
          <p className={styles.emptyText}>
            Create a profile for your child, or approve a self sign-up code from the Code tab.
          </p>
          <Link href="/parent/children/new" className={styles.primaryBtn}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            Create first learner
          </Link>
        </div>
      ) : (
        <div className={styles.groupedList}>
          <ul className={styles.listGroup}>
            {children.map((child, index) => (
              <li
                key={child.userId}
                className={index < children.length - 1 ? styles.listGroupItem : styles.listGroupItemLast}
              >
                <LearnerProfileRow child={child} onDeleted={() => void load()} />
              </li>
            ))}
          </ul>
          <p className={styles.listFootnote}>
            Tap a learner to open their progress dashboard.
          </p>
        </div>
      )}
    </section>
  );
}
