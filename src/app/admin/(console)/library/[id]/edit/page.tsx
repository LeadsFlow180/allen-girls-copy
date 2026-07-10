"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { TeacherLibraryStoryForm } from "@/components/teacher/teacher-library-story-form";
import styles from "@/components/teacher/teacher-library.module.css";
import type { LibraryStoryRow } from "@/lib/library/library-story-row";

type PageProps = { params: Promise<{ id: string }> };

const BASE_PATH = "/admin/library";

export default function AdminLibraryEditPage({ params }: PageProps) {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [story, setStory] = useState<LibraryStoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { id } = await params;
      if (cancelled) return;
      setStoryId(id);

      try {
        const res = await fetch(`/api/teacher/library/stories/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setError("Story not found in Supabase. Import it from the library page first.");
          return;
        }
        const json = (await res.json()) as { story?: LibraryStoryRow };
        setStory(json.story ?? null);
      } catch {
        setError("Could not load story.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) {
    return <p className={`font-nunito ${styles.empty}`}>Loading story…</p>;
  }

  if (error || !story) {
    return (
      <div className={styles.formPage}>
        <p className={`font-nunito ${styles.error}`}>{error ?? "Story not found."}</p>
        <Link href={BASE_PATH} className={styles.backLink}>
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <h1 className={`font-fredoka ${styles.formTitle}`}>Edit: {story.title}</h1>
      <p className={`font-nunito ${styles.formLead}`}>
        Shared library · ID: {storyId}. Changes apply for all learners.
      </p>
      <div className={styles.formCard}>
        <TeacherLibraryStoryForm mode="edit" initial={story} basePath={BASE_PATH} />
      </div>
    </div>
  );
}
