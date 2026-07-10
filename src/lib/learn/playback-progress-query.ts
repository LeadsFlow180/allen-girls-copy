import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlaybackProgressRow } from "@/lib/learn/playback-progress";

const FULL_SELECT =
  "guest_session_id, learner_id, db_section_id, db_unit_id, classroom_id, current_scene_id, scene_index, action_index, playback_completed, status, last_played_at, updated_at, details, quiz";

const CORE_SELECT =
  "guest_session_id, learner_id, classroom_id, current_scene_id, scene_index, action_index, playback_completed, status, updated_at, details";

/** Loads one playback row; retries with fewer columns if the project DB is on an older schema. */
export async function fetchPlaybackProgressRow(
  db: SupabaseClient,
  filters: {
    classroomId: string;
    guestSessionId?: string | null;
    learnerId?: string | null;
  },
): Promise<{ data: PlaybackProgressRow | null; error: Error | null }> {
  const base = () => {
    let q = db.from("learn_playback_progress").select(FULL_SELECT).eq("classroom_id", filters.classroomId);
    if (filters.guestSessionId) {
      q = q.eq("guest_session_id", filters.guestSessionId);
    } else if (filters.learnerId) {
      q = q.eq("learner_id", filters.learnerId);
    }
    return q.maybeSingle();
  };

  let { data, error } = await base();

  if (error) {
    let q = db.from("learn_playback_progress").select(CORE_SELECT).eq("classroom_id", filters.classroomId);
    if (filters.guestSessionId) {
      q = q.eq("guest_session_id", filters.guestSessionId);
    } else if (filters.learnerId) {
      q = q.eq("learner_id", filters.learnerId);
    }
    const retry = await q.maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  return {
    data: (data as PlaybackProgressRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}
