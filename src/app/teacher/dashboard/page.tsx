"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Copy, Check } from "lucide-react";

import classroom from "@/components/teacher/teacher-classroom.module.css";
import { formatStudentNumber } from "@/lib/student/format-student-number";

type DomainTier = { domain: string; tier: string; percent: number };
type GameSkill = { skillId: string; accuracyPercent: number; attempts: number } | null;
type StudentGames = {
  playSeconds: number;
  sessions: number;
  questionsAsked: number;
  questionsCorrect: number;
  gamePoints: number;
  accuracyPercent: number | null;
  strongestSkill: GameSkill;
  weakestSkill: GameSkill;
  perGame: {
    gameSlug: string;
    gameTitle: string;
    gameClass: "academic" | "arcade";
    sessions: number;
    playSeconds: number;
    questionsAsked: number;
    questionsCorrect: number;
    pointsEarned: number;
  }[];
};
type StudentRow = {
  userId: string;
  studentNumber: number | null;
  displayName: string;
  linkedAt: string;
  placementTier: string | null;
  overallPercent: number | null;
  domainTiers: DomainTier[];
  points: { balance: number; lifetimeEarned: number } | null;
  games?: StudentGames;
};

function formatPlaytime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

type DashboardData = {
  inviteCode: string | null;
  classroomName: string;
  students: StudentRow[];
};

const TIER_LABELS: Record<string, string> = {
  emerging: "Emerging",
  on_track: "On Track",
  stretch: "Stretch",
};

const TIER_CLASS: Record<string, string> = {
  emerging: classroom.tierEmerging,
  on_track: classroom.tierOnTrack,
  stretch: classroom.tierStretch,
};

const STAT_COLORS: Record<string, string> = {
  Students: "#0284c7",
  "Class Average": "#7c22c5",
  Emerging: "#d97706",
  "On Track": "#2563eb",
  Stretch: "#7c3aed",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className={classroom.tierNone}>No placement</span>;
  return (
    <span className={`${classroom.tierBadge} ${TIER_CLASS[tier] ?? ""}`}>
      {TIER_LABELS[tier] ?? tier}
    </span>
  );
}

export default function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        if (res.status === 401) {
          setError("Please sign in to your teacher account.");
          return;
        }
        if (res.status === 403) {
          setError("This dashboard is for teacher accounts only.");
          return;
        }
        if (!res.ok) {
          setError("Could not load dashboard.");
          return;
        }
        setData((await res.json()) as DashboardData);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const copyCode = async () => {
    if (!data?.inviteCode) return;
    await navigator.clipboard.writeText(data.inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const students = data?.students ?? [];
  const withPlacement = students.filter((s) => s.overallPercent !== null);
  const avgPercent = withPlacement.length
    ? Math.round(withPlacement.reduce((sum, s) => sum + (s.overallPercent ?? 0), 0) / withPlacement.length)
    : null;

  const tierCounts = { emerging: 0, on_track: 0, stretch: 0 } as Record<string, number>;
  for (const s of students) {
    if (s.placementTier) tierCounts[s.placementTier] = (tierCounts[s.placementTier] ?? 0) + 1;
  }

  const gameQuestionsAsked = students.reduce((n, s) => n + (s.games?.questionsAsked ?? 0), 0);
  const gameQuestionsCorrect = students.reduce((n, s) => n + (s.games?.questionsCorrect ?? 0), 0);
  const classGameAccuracy =
    gameQuestionsAsked > 0 ? Math.round((gameQuestionsCorrect / gameQuestionsAsked) * 100) : null;

  const stats = [
    { label: "Students", value: `${students.length}` },
    { label: "Class Average", value: avgPercent !== null ? `${avgPercent}%` : "—" },
    { label: "Emerging", value: `${tierCounts.emerging ?? 0}` },
    { label: "On Track", value: `${tierCounts.on_track ?? 0}` },
    { label: "Stretch", value: `${tierCounts.stretch ?? 0}` },
    {
      label: "Game Q's",
      value: gameQuestionsAsked > 0 ? `${gameQuestionsAsked}${classGameAccuracy !== null ? ` · ${classGameAccuracy}%` : ""}` : "—",
    },
  ];

  return (
    <article className={classroom.pagePanel}>
      <header className={classroom.panelHeader}>
        <div className={classroom.panelTitleRow}>
          <Users className={classroom.panelIcon} size={24} aria-hidden />
          <h1 className={`font-fredoka ${classroom.panelTitle}`}>Classroom</h1>
        </div>
        <p className={`font-nunito ${classroom.panelLead}`}>
          {data?.classroomName || "Your classroom"} · {students.length} student
          {students.length !== 1 ? "s" : ""} linked
        </p>

        {data?.inviteCode ? (
          <div className={classroom.inviteRow}>
            <span className={`font-nunito ${classroom.inviteLabel}`}>Student link code:</span>
            <span className={`font-fredoka ${classroom.inviteCode}`}>{data.inviteCode}</span>
            <button
              type="button"
              onClick={() => void copyCode()}
              title="Copy code"
              className={classroom.copyBtn}
            >
              {codeCopied ? (
                <Check size={16} style={{ color: "#059669" }} />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        ) : null}
      </header>

      {loading ? (
        <p className={`font-nunito ${classroom.loading}`}>Loading…</p>
      ) : null}

      {error ? (
        <div className={classroom.errorBox}>
          <p className={`font-nunito ${classroom.errorText}`}>{error}</p>
          <Link href="/account/login" className={classroom.primaryBtn}>
            Sign in
          </Link>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {students.length > 0 ? (
            <div className={classroom.statGrid}>
              {stats.map((stat) => (
                <div key={stat.label} className={classroom.statCard}>
                  <span
                    className={`font-fredoka ${classroom.statValue}`}
                    style={{ color: STAT_COLORS[stat.label] ?? "#0f172a" }}
                  >
                    {stat.value}
                  </span>
                  <span className={`font-nunito ${classroom.statLabel}`}>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}

          {students.length === 0 ? (
            <div className={classroom.emptyState}>
              <p className={classroom.emptyEmoji} aria-hidden>
                👩‍🏫
              </p>
              <h2 className={`font-fredoka ${classroom.emptyTitle}`}>No students linked yet</h2>
              <p className={`font-nunito ${classroom.emptyLead}`}>
                Ask students to share their approval code with you, then add them below.
              </p>
              <Link href="/teacher/link-student" className={`font-nunito ${classroom.primaryBtn}`}>
                Add a student
              </Link>
            </div>
          ) : (
            <div className={classroom.tableWrap}>
              <div className={classroom.tableHead}>
                {["Student", "Placement", "ELA", "Math", "Points"].map((h) => (
                  <span key={h} className={`font-nunito ${classroom.tableHeadCell}`}>
                    {h}
                  </span>
                ))}
              </div>

              {students.map((student) => {
                const elaTier = student.domainTiers.find((d) => d.domain === "ela");
                const mathTier = student.domainTiers.find((d) => d.domain === "math");
                const isExpanded = expandedId === student.userId;

                return (
                  <div key={student.userId} className={classroom.tableRow}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : student.userId)}
                      className={classroom.rowBtn}
                    >
                      <div className={classroom.studentCell}>
                        <div className={classroom.studentAvatar}>
                          {student.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-nunito ${classroom.studentName}`}>
                          {student.displayName}
                          {student.studentNumber === null
                            ? ""
                            : ` · ID ${formatStudentNumber(student.studentNumber)}`}
                        </span>
                      </div>
                      <TierBadge tier={student.placementTier} />
                      <span className={`font-nunito ${classroom.cellEla}`}>
                        {elaTier ? `${elaTier.percent}%` : "—"}
                      </span>
                      <span className={`font-nunito ${classroom.cellMath}`}>
                        {mathTier ? `${mathTier.percent}%` : "—"}
                      </span>
                      <span className={`font-nunito ${classroom.cellPoints}`}>
                        {student.points?.balance.toLocaleString() ?? "—"}
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className={classroom.expanded}>
                        <div className={classroom.tagRow}>
                          {student.domainTiers.map((dt) => (
                            <span
                              key={dt.domain}
                              className={`font-nunito ${classroom.domainTag}`}
                              style={{
                                color: dt.domain === "ela" ? "#7c22c5" : "#0ea5e9",
                                borderColor: dt.domain === "ela" ? "#e9d5ff" : "#bae6fd",
                              }}
                            >
                              {dt.domain.toUpperCase()} · {TIER_LABELS[dt.tier] ?? dt.tier} ·{" "}
                              {dt.percent}%
                            </span>
                          ))}
                          <span className={`font-nunito ${classroom.pointsTag}`}>
                            ⭐ {student.points?.lifetimeEarned.toLocaleString() ?? 0} lifetime pts
                          </span>
                        </div>
                        {student.games && student.games.sessions > 0 ? (
                          <div className={`font-nunito ${classroom.tagRow}`} style={{ marginTop: 8 }}>
                            <span
                              className={classroom.domainTag}
                              style={{ color: "#0d6b73", borderColor: "#a5f3fc" }}
                            >
                              🎮 {formatPlaytime(student.games.playSeconds)} played
                            </span>
                            {student.games.questionsAsked > 0 ? (
                              <span
                                className={classroom.domainTag}
                                style={{ color: "#0369a1", borderColor: "#bae6fd" }}
                              >
                                {student.games.questionsCorrect}/{student.games.questionsAsked} correct
                                {student.games.accuracyPercent !== null
                                  ? ` · ${student.games.accuracyPercent}%`
                                  : ""}
                              </span>
                            ) : null}
                            <span className={classroom.pointsTag}>
                              ⭐ {student.games.gamePoints} game pts
                            </span>
                            {student.games.strongestSkill ? (
                              <span
                                className={classroom.domainTag}
                                style={{ color: "#15803d", borderColor: "#bbf7d0" }}
                              >
                                Strongest: {student.games.strongestSkill.skillId} (
                                {student.games.strongestSkill.accuracyPercent}%)
                              </span>
                            ) : null}
                            {student.games.weakestSkill &&
                            student.games.weakestSkill.skillId !==
                              student.games.strongestSkill?.skillId ? (
                              <span
                                className={classroom.domainTag}
                                style={{ color: "#b45309", borderColor: "#fde68a" }}
                              >
                                Needs work: {student.games.weakestSkill.skillId} (
                                {student.games.weakestSkill.accuracyPercent}%)
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        <p className={`font-nunito ${classroom.linkedAt}`}>
                          Linked {new Date(student.linkedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {students.length > 0 ? (
            <div className={classroom.footerActions}>
              <Link href="/teacher/link-student" className={`font-nunito ${classroom.primaryBtn}`}>
                + Add a student
              </Link>
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}
