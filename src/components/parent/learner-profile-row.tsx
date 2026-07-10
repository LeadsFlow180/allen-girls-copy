"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import type { ParentChildListItem } from "@/app/api/parent/children/route";

import styles from "@/app/parent/family.module.css";

type Props = {
  child: ParentChildListItem;
  onDeleted: () => void;
};

export function LearnerProfileRow({ child, onDeleted }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial = child.displayName.charAt(0).toUpperCase();
  const canConfirm =
    confirmName.trim().toLowerCase() === child.displayName.trim().toLowerCase();

  const closeMenu = () => {
    setMenuOpen(false);
    setDeleteOpen(false);
    setConfirmName("");
    setError(null);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!canConfirm || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/parent/children/${child.userId}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(errorMessage(json.error));
        return;
      }
      closeMenu();
      onDeleted();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.listRowWrap}>
      <div className={styles.listRow}>
        <Link href="/parent/dashboard" className={styles.listRowLink}>
          <span className={styles.avatar} aria-hidden>
            {initial}
          </span>
          <span className={styles.listRowText}>
            <span className={styles.listRowTop}>
              <span className={styles.childName}>{child.displayName}</span>
              <span
                className={
                  child.isApproved ? styles.statusDotVerified : styles.statusDotPending
                }
                title={child.isApproved ? "Verified" : "Pending approval"}
              />
            </span>
            {child.email && <span className={styles.childEmail}>{child.email}</span>}
            <span className={styles.childSource}>
              {child.guardianCreated ? "Created by you" : "Linked via approval code"}
            </span>
          </span>
          <ChevronRight className={styles.listChevron} size={18} strokeWidth={2} aria-hidden />
        </Link>

        <div className={styles.listRowMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={`Options for ${child.displayName}`}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((open) => !open);
              setDeleteOpen(false);
              setError(null);
              setConfirmName("");
            }}
          >
            <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
          </button>

          {menuOpen && !deleteOpen && (
            <div className={styles.menuPopover} role="menu">
              <button
                type="button"
                className={styles.menuDangerItem}
                role="menuitem"
                onClick={() => setDeleteOpen(true)}
              >
                Remove profile
              </button>
              <button type="button" className={styles.menuItem} role="menuitem" onClick={closeMenu}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {deleteOpen && (
        <div className={styles.deletePanel}>
          <p className={styles.deletePanelTitle}>Remove {child.displayName}?</p>
          <p className={styles.deletePanelText}>
            This permanently deletes their login and all learning data.
          </p>
          <label className={styles.deletePanelText} htmlFor={`confirm-${child.userId}`}>
            Type <strong>{child.displayName}</strong> to confirm:
          </label>
          <input
            id={`confirm-${child.userId}`}
            className={styles.deleteConfirmInput}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            autoComplete="off"
            disabled={busy}
          />
          <div className={styles.deleteActions}>
            <button
              type="button"
              className={styles.dangerBtn}
              disabled={!canConfirm || busy}
              onClick={() => void handleDelete()}
            >
              {busy ? "Removing…" : "Delete permanently"}
            </button>
            <button
              type="button"
              className={styles.linkBtnMuted}
              disabled={busy}
              onClick={closeMenu}
            >
              Keep profile
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}
    </div>
  );
}

function errorMessage(code?: string): string {
  switch (code) {
    case "child_not_linked":
      return "This learner is not linked to your family account.";
    case "service_role_required":
      return "Server is missing service role key — contact support.";
    case "not_parent":
      return "Only guardian accounts can remove learners.";
    case "cannot_delete_self":
      return "You cannot remove your own account here.";
    default:
      return "Could not remove profile. Try again.";
  }
}
