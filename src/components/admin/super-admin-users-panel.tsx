"use client";

import { useEffect, useMemo, useState } from "react";

import type { AdminUserRow } from "@/lib/admin/fetch-admin-users";
import { formatStudentNumber } from "@/lib/student/format-student-number";

import styles from "./super-admin-users-panel.module.css";

const ROLE_LABEL: Record<string, string> = {
  student: "Learner",
  parent: "Guardian",
  teacher: "Teacher",
  super_admin: "Super Admin",
};

function formatRole(role: string): string {
  return ROLE_LABEL[role] ?? role;
}

function roleBadgeClass(role: string, styles: Record<string, string>): string {
  if (role === "student") return styles.role_student ?? "";
  if (role === "parent") return styles.role_parent ?? "";
  if (role === "teacher") return styles.role_teacher ?? "";
  if (role === "super_admin") return styles.role_super_admin ?? "";
  return "";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function SuperAdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("Could not load users.");
          return;
        }
        const json = (await res.json()) as { users?: AdminUserRow[] };
        if (!cancelled) setUsers(json.users ?? []);
      } catch {
        if (!cancelled) setError("Could not load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!q) return true;
      return (
        user.displayName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        (user.studentNumber !== null &&
          formatStudentNumber(user.studentNumber).includes(q.replace(/^student\s*id\s*/i, "")))
      );
    });
  }, [users, roleFilter, search]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const user of users) {
      tally[user.role] = (tally[user.role] ?? 0) + 1;
    }
    return tally;
  }, [users]);

  return (
    <section className={styles.panel} aria-labelledby="users-heading">
      <div className={styles.head}>
        <div>
          <h2 id="users-heading" className={`font-fredoka ${styles.title}`}>
            All users
          </h2>
          <p className={`font-nunito ${styles.lead}`}>
            Every account with role, learning progress, and approval status.
          </p>
        </div>
        <div className={styles.stats}>
          <span className={styles.statPill}>{users.length} total</span>
          <span className={styles.statPill}>{counts.student ?? 0} learners</span>
          <span className={styles.statPill}>{counts.teacher ?? 0} teachers</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Search name, email, or student ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
        />
        <select
          className={styles.select}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="student">Learners</option>
          <option value="parent">Guardians</option>
          <option value="teacher">Teachers</option>
          <option value="super_admin">Super Admins</option>
        </select>
      </div>

      {loading ? <p className={styles.message}>Loading users…</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Lessons</th>
                <th>Path %</th>
                <th>Approved</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className={styles.nameCell}>{user.displayName}</td>
                  <td>
                    {user.studentNumber === null ? "—" : formatStudentNumber(user.studentNumber)}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${roleBadgeClass(user.role, styles)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td>{user.completedLessons}</td>
                  <td>{user.sectionPercent}%</td>
                  <td>
                    {user.parentApproved === null
                      ? "—"
                      : user.parentApproved
                        ? "Yes"
                        : "Pending"}
                  </td>
                  <td>{formatDate(user.lastPlayedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className={styles.message}>No users match your filters.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
