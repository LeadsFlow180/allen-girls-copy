import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildLeaderboardSnapshot,
  countCompletedLessonsFromDetailsList,
  displayNameFromProfile,
  type LeaderboardSnapshot,
} from "@/lib/learn/leaderboard";

type ProfileRow = {
  id: string;
  display_name: string | null;
  role: string;
};

type PlaybackRow = {
  learner_id: string | null;
  details: unknown;
};

export async function fetchLeaderboardSnapshot(
  db: SupabaseClient,
  currentUserId: string | null,
): Promise<LeaderboardSnapshot> {
  const [profilesRes, playbackRes] = await Promise.all([
    db
      .from("profiles")
      .select("id, display_name, role")
      .eq("role", "student")
      .order("display_name", { ascending: true }),
    db
      .from("learn_playback_progress")
      .select("learner_id, details")
      .not("learner_id", "is", null),
  ]);

  if (profilesRes.error) {
    throw new Error(profilesRes.error.message);
  }
  if (playbackRes.error) {
    throw new Error(playbackRes.error.message);
  }

  const detailsByLearner = new Map<string, unknown[]>();

  for (const row of (playbackRes.data ?? []) as PlaybackRow[]) {
    const learnerId = row.learner_id;
    if (!learnerId) continue;
    const bucket = detailsByLearner.get(learnerId) ?? [];
    bucket.push(row.details);
    detailsByLearner.set(learnerId, bucket);
  }

  const rows = ((profilesRes.data ?? []) as ProfileRow[]).map((profile) => ({
    userId: profile.id,
    displayName: displayNameFromProfile(profile.display_name, profile.id),
    completedLessons: countCompletedLessonsFromDetailsList(
      detailsByLearner.get(profile.id) ?? [],
    ),
  }));

  return buildLeaderboardSnapshot(rows, currentUserId);
}
