import type { SupabaseClient } from "@supabase/supabase-js";

import {
  countCompletedLessonsFromDetailsList,
  mergeStepProgressMaps,
} from "@/lib/learn/leaderboard";
import {
  getPlaybackSectionPercent,
  type PlaybackProgressRow,
} from "@/lib/learn/playback-progress";

export type AdminUserRow = {
  id: string;
  studentNumber: number | null;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  completedLessons: number;
  sectionPercent: number;
  parentApproved: boolean | null;
  parentUserId: string | null;
  lastPlayedAt: string | null;
};

type ProfileRow = {
  id: string;
  role: string;
  display_name: string | null;
  created_at: string;
};

type StudentRow = {
  user_id: string;
  student_number: number;
  parent_user_id: string | null;
  parent_approved_at: string | null;
};

type PlaybackRow = {
  learner_id: string | null;
  details: unknown;
  last_played_at: string | null;
};

async function listAuthEmails(admin: SupabaseClient): Promise<Map<string, string>> {
  const emails = new Map<string, string>();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      if (user.email) emails.set(user.id, user.email);
    }

    if (data.users.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  return emails;
}

export async function fetchAdminUserDirectory(admin: SupabaseClient): Promise<AdminUserRow[]> {
  const [profilesRes, studentsRes, playbackRes, emailMap] = await Promise.all([
    admin.from("profiles").select("id, role, display_name, created_at").order("created_at", {
      ascending: false,
    }),
    admin
      .from("student_profiles")
      .select("user_id, student_number, parent_user_id, parent_approved_at"),
    admin
      .from("learn_playback_progress")
      .select("learner_id, details, last_played_at")
      .not("learner_id", "is", null),
    listAuthEmails(admin),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (playbackRes.error) throw new Error(playbackRes.error.message);

  const studentById = new Map<string, StudentRow>();
  for (const row of (studentsRes.data ?? []) as StudentRow[]) {
    studentById.set(row.user_id, row);
  }

  const detailsByLearner = new Map<string, unknown[]>();
  const lastPlayedByLearner = new Map<string, string | null>();

  for (const row of (playbackRes.data ?? []) as PlaybackRow[]) {
    const learnerId = row.learner_id;
    if (!learnerId) continue;
    const bucket = detailsByLearner.get(learnerId) ?? [];
    bucket.push(row.details);
    detailsByLearner.set(learnerId, bucket);

    const prev = lastPlayedByLearner.get(learnerId);
    const next = row.last_played_at;
    if (next && (!prev || new Date(next) > new Date(prev))) {
      lastPlayedByLearner.set(learnerId, next);
    }
  }

  return ((profilesRes.data ?? []) as ProfileRow[]).map((profile) => {
    const student = studentById.get(profile.id);
    const detailsList = detailsByLearner.get(profile.id) ?? [];
    const mergedStepProgress = mergeStepProgressMaps(detailsList);
    const playbackRow: PlaybackProgressRow | null =
      Object.keys(mergedStepProgress).length > 0
        ? { learner_id: profile.id, details: { stepProgress: mergedStepProgress } }
        : detailsList[0]
          ? { learner_id: profile.id, details: detailsList[0] }
          : null;

    return {
      id: profile.id,
      studentNumber: student?.student_number ?? null,
      email: emailMap.get(profile.id) ?? "—",
      displayName: profile.display_name?.trim() || "Unnamed",
      role: profile.role,
      createdAt: profile.created_at,
      completedLessons: countCompletedLessonsFromDetailsList(detailsList),
      sectionPercent: Math.round(
        getPlaybackSectionPercent(playbackRow, { unitsInSection: 10 }),
      ),
      parentApproved: student ? Boolean(student.parent_approved_at) : null,
      parentUserId: student?.parent_user_id ?? null,
      lastPlayedAt: lastPlayedByLearner.get(profile.id) ?? null,
    };
  });
}
