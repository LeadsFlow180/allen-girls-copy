"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CloudUpload,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { LibraryCoverImage, resolveLibraryCoverSrc } from "@/components/library/library-cover-image";
import { LIBRARY_NOVEL_COVERS } from "@/lib/library/library-art";
import type { TeacherLibraryCatalogItem } from "@/lib/library/teacher-library-catalog";
import type { LibraryWingId } from "@/lib/library/library-catalog";

import styles from "./teacher-library.module.css";

type CatalogStats = {
  total: number;
  inDatabase: number;
  pendingUpload: number;
  published: number;
  allenGirls: number;
  licensed: number;
  sharedCatalog: boolean;
};

type WingFilter = "all" | LibraryWingId;

type TeacherLibraryHubProps = {
  basePath?: string;
};

export function TeacherLibraryHub({ basePath = "/admin/library" }: TeacherLibraryHubProps) {
  const [catalog, setCatalog] = useState<TeacherLibraryCatalogItem[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [wing, setWing] = useState<WingFilter>("all");
  const [syncing, setSyncing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/library/catalog", { cache: "no-store" });
      if (res.status === 401) {
        setError("Please sign in to your super admin account.");
        return;
      }
      if (res.status === 403) {
        setError("This page is for super admin accounts only.");
        return;
      }
      if (!res.ok) {
        setError("Could not load library catalog.");
        return;
      }
      const json = (await res.json()) as {
        catalog?: TeacherLibraryCatalogItem[];
        stats?: CatalogStats;
      };
      setCatalog(json.catalog ?? []);
      setStats(json.stats ?? null);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (wing !== "all" && item.wing !== wing) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
      );
    });
  }, [catalog, search, wing]);

  const uploadAll = async () => {
    setSyncing(true);
    setNotice(null);
    setError(null);
    try {
      const res = await fetch("/api/teacher/library/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        seeded?: string[];
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Upload failed. Check Supabase env vars and migration 018.");
        return;
      }
      setNotice(json.message ?? `Uploaded ${json.seeded?.length ?? 0} stories to Supabase.`);
      await loadCatalog();
    } catch {
      setError("Upload failed.");
    } finally {
      setSyncing(false);
    }
  };

  const importOne = async (id: string) => {
    setImportingId(id);
    setError(null);
    try {
      const res = await fetch("/api/teacher/library/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not import story.");
        return;
      }
      window.location.href = `${basePath}/${encodeURIComponent(id)}/edit`;
    } catch {
      setError("Import failed.");
    } finally {
      setImportingId(null);
    }
  };

  useEffect(() => {
    if (!deleteTarget) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingId) setDeleteTarget(null);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteTarget, deletingId]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { id, title } = deleteTarget;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/library/stories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Could not remove story.");
        return;
      }
      setDeleteTarget(null);
      setNotice(`“${title}” was removed from the library.`);
      await loadCatalog();
    } catch {
      setError("Could not remove story. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <h1 className={`font-fredoka ${styles.heroTitle}`}>Library</h1>
            <p className={`font-nunito ${styles.heroLead}`}>
              Manage the shared story catalog. Upload all 42 built-in books to Supabase, edit chapters,
              replace covers, or add new stories. Only Super Admins can change library content.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={`font-fredoka ${styles.btnSecondary}`}
              disabled={syncing || loading}
              onClick={() => void uploadAll()}
            >
              <CloudUpload size={16} aria-hidden />
              {syncing ? "Uploading…" : "Upload all 42 to Supabase"}
            </button>
            <Link href={`${basePath}/new`} className={`font-fredoka ${styles.btnPrimary}`}>
              <Plus size={16} aria-hidden />
              New story
            </Link>
          </div>
        </div>

        {stats ? (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={`font-fredoka ${styles.statValue}`}>{stats.total}</span>
              <span className={`font-nunito ${styles.statLabel}`}>Total books</span>
            </div>
            <div className={styles.statCard}>
              <span className={`font-fredoka ${styles.statValue}`}>{stats.inDatabase}</span>
              <span className={`font-nunito ${styles.statLabel}`}>In Supabase</span>
            </div>
            <div className={styles.statCard}>
              <span className={`font-fredoka ${styles.statValue}`}>{stats.pendingUpload}</span>
              <span className={`font-nunito ${styles.statLabel}`}>Need upload</span>
            </div>
            <div className={styles.statCard}>
              <span className={`font-fredoka ${styles.statValue}`}>{stats.allenGirls}</span>
              <span className={`font-nunito ${styles.statLabel}`}>Allen Girls</span>
            </div>
            <div className={styles.statCard}>
              <span className={`font-fredoka ${styles.statValue}`}>{stats.licensed}</span>
              <span className={`font-nunito ${styles.statLabel}`}>Licensed</span>
            </div>
          </div>
        ) : null}
      </header>

      {error ? <p className={`font-nunito ${styles.error}`}>{error}</p> : null}
      {notice ? <p className={`font-nunito ${styles.success}`}>{notice}</p> : null}

      {(stats?.pendingUpload ?? 0) > 0 ? (
        <div className={styles.syncBanner}>
          <div>
            <strong className="font-fredoka">
              {stats?.pendingUpload} stories still need uploading to Supabase
            </strong>
            <p className="font-nunito">
              Click &quot;Upload all 42 to Supabase&quot; to copy every book, chapter text, cover thumbnail,
              and PDF into the shared database. This is a one-time step (safe to run again).
            </p>
          </div>
          <button
            type="button"
            className={`font-fredoka ${styles.btnPrimary}`}
            disabled={syncing}
            onClick={() => void uploadAll()}
          >
            <CloudUpload size={16} aria-hidden />
            {syncing ? "Uploading…" : "Upload now"}
          </button>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <div style={{ position: "relative", flex: "1 1 14rem" }}>
          <Search
            size={16}
            aria-hidden
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
          />
          <input
            className={`font-nunito ${styles.search}`}
            style={{ paddingLeft: "2.25rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, id, or author…"
          />
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Filter by wing">
          {([
            ["all", "All wings"],
            ["allen_girls", "Allen Girls"],
            ["licensed", "Licensed"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={wing === value}
              className={`font-nunito ${wing === value ? styles.tabOn : styles.tab}`}
              onClick={() => setWing(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={`font-nunito ${styles.empty}`}>Loading library catalog…</p>
      ) : filtered.length === 0 ? (
        <p className={`font-nunito ${styles.empty}`}>No stories match your search.</p>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((item) => {
            const cover = resolveLibraryCoverSrc(item.id, item.coverUrl, LIBRARY_NOVEL_COVERS);
            return (
              <li key={item.id} className={styles.card}>
                <div className={styles.coverWrap}>
                  <div className={styles.badgeRow}>
                    {item.tier === "vip" ? (
                      <span className={`${styles.badge} ${styles.badgeVip}`}>VIP</span>
                    ) : null}
                    {!item.isPublished ? (
                      <span className={`${styles.badge} ${styles.badgeDraft}`}>Draft</span>
                    ) : null}
                    {!item.inDatabase ? (
                      <span className={`${styles.badge} ${styles.badgePending}`}>Not in DB</span>
                    ) : null}
                    <span
                      className={`${styles.badge} ${
                        item.wing === "allen_girls" ? styles.badgeWingAllen : styles.badgeWingLicensed
                      }`}
                    >
                      {item.wing === "allen_girls" ? "Allen" : "Licensed"}
                    </span>
                  </div>
                  {cover ? (
                    <LibraryCoverImage src={cover} alt={item.title} className={styles.cover} />
                  ) : (
                    <span className={styles.coverFallback}>
                      <BookOpen size={28} aria-hidden />
                    </span>
                  )}
                </div>

                <div className={styles.body}>
                  <h2 className={`font-fredoka ${styles.title}`}>{item.title}</h2>
                  <p className={`font-nunito ${styles.meta}`}>
                    {item.useChapters
                      ? `${item.chapterCount} chapter${item.chapterCount === 1 ? "" : "s"}`
                      : "Single story"}{" "}
                    · {item.readMinutes} min
                    <br />
                    {item.id}
                  </p>

                  <div className={styles.actions}>
                    {item.inDatabase ? (
                      <>
                        <Link
                          href={`${basePath}/${encodeURIComponent(item.id)}/edit`}
                          className={`font-nunito ${styles.actionBtn}`}
                        >
                          <Pencil size={12} aria-hidden />
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={`font-nunito ${styles.actionBtnDanger}`}
                          disabled={deletingId === item.id}
                          onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                        >
                          <Trash2 size={12} aria-hidden />
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={`font-nunito ${styles.actionBtn}`}
                        style={{ flex: 1 }}
                        disabled={importingId === item.id}
                        onClick={() => void importOne(item.id)}
                      >
                        <Sparkles size={12} aria-hidden />
                        {importingId === item.id ? "Importing…" : "Import & edit"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {deleteTarget ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => {
            if (!deletingId) setDeleteTarget(null);
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className={`font-nunito ${styles.modalEyebrow}`}>Remove story</p>
            <h2 id="library-delete-title" className={`font-fredoka ${styles.modalTitle}`}>
              {deleteTarget.title}
            </h2>
            <p className={`font-nunito ${styles.modalLead}`}>
              This permanently removes the book from the shared library. Learners will no longer see
              it in the Library Labyrinth.
            </p>
            <p className={`font-nunito ${styles.modalMeta}`}>ID: {deleteTarget.id}</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`font-nunito ${styles.modalBtnCancel}`}
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`font-nunito ${styles.modalBtnDanger}`}
                disabled={deletingId === deleteTarget.id}
                onClick={() => void confirmDelete()}
              >
                {deletingId === deleteTarget.id ? "Removing…" : "Remove story"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
