import type { PlacementScoreResult } from "@/data/lms/placement/types";

/**
 * Saves placement to Supabase when the student is signed in.
 * Safe to call from the browser; no-op if not logged in or request fails.
 */
export async function syncPlacementToCloud(displayName: string, score: PlacementScoreResult): Promise<boolean> {
  try {
    const res = await fetch("/api/placement/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        displayName: displayName.trim().slice(0, 80),
        score,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
