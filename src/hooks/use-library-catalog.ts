"use client";

import { useEffect, useState } from "react";

import { LIBRARY_NOVELS, type LibraryNovel } from "@/lib/library/library-catalog";

type ApiNovel = LibraryNovel;

export function useLibraryCatalog() {
  const [novels, setNovels] = useState<LibraryNovel[]>(LIBRARY_NOVELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/library/stories", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch_failed");
        const json = (await res.json()) as { novels?: ApiNovel[] };
        if (!cancelled && Array.isArray(json.novels) && json.novels.length > 0) {
          setNovels(json.novels);
        }
      } catch {
        if (!cancelled) setError("Could not refresh library catalog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { novels, loading, error };
}
