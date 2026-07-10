import type { ReactNode } from "react";
import Link from "next/link";

import { getSkillsByModuleId } from "@/data/lms/curriculum/skills/modules";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateSparkMessage } from "@/lib/ai/spark";

/** Must read cookies / session — not a static snapshot at build time. */
export const dynamic = "force-dynamic";

function tierFriendly(t: string) {
  if (t === "emerging") return "Building foundations";
  if (t === "on_track") return "On track";
  if (t === "stretch") return "Ready for stretch";
  return t;
}

function focusFriendly(d: string) {
  return d === "math" ? "Math & STEM" : "Reading & language";
}

export default async function LearnPathPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const supabase = supabaseConfigured ? await createServerSupabaseClient() : null;

  let personalized: ReactNode = null;

  if (!supabaseConfigured) {
    personalized = (
      <p className="path-step-text" style={{ marginTop: "1rem" }}>
        Cloud saving is off on this build. When your project has Supabase keys in <code>.env.local</code>, student paths
        will show up here automatically.
      </p>
    );
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

      if (profile?.role === "student") {
        const { data: path } = await supabase
          .from("student_learning_path")
          .select("*")
          .eq("student_user_id", user.id)
          .maybeSingle();

        const { data: tiers } = await supabase
          .from("student_domain_tiers")
          .select("domain, tier, percent, updated_at")
          .eq("student_user_id", user.id);

        if (path) {
          const sparkRecap = await generateSparkMessage({
            nickname: "Recruit",
            mode: "reentry",
            missionTitle: path.active_module_id,
            worldTitle: path.recommended_world_slug,
            learnerSignals: tiers?.map((t) => `${t.domain}_${t.tier}`) ?? [],
            instruction:
              "Give a short re-entry recap for the student learning path page with one clear next step.",
            maxWords: 55,
          });

          const skills = getSkillsByModuleId(path.active_module_id);
          const idList = Array.isArray(path.next_skill_ids) ? (path.next_skill_ids as string[]) : [];
          const skillLines = idList
            .map((id) => skills.find((s) => s.id === id))
            .filter(Boolean)
            .slice(0, 6);

          personalized = (
            <section className="space-y-4" style={{ marginTop: "1.5rem" }}>
              <div
                className="path-step"
                style={{
                  border: "2px solid var(--accent, #7c3aed)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  background: "rgba(124, 58, 237, 0.06)",
                }}
              >
                <span className="path-step-number" style={{ background: "var(--accent, #7c3aed)" }}>
                  ★
                </span>
                <div>
                  <h2 className="path-step-title">Your personalized route</h2>
                  <p className="path-step-text" style={{ marginBottom: "0.75rem" }}>
                    S.P.A.R.K. saved your last Mission Ready scan. Here is where to start next.
                  </p>
                  <p className="path-step-text" style={{ marginBottom: "0.75rem", fontStyle: "italic" }}>
                    “{sparkRecap}”
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.6 }}>
                    <li>
                      <strong>First world to explore:</strong>{" "}
                      <Link href={`/worlds/${path.recommended_world_slug}`} style={{ color: "var(--accent)", fontWeight: 700 }}>
                        Open world →
                      </Link>
                    </li>
                    <li>
                      <strong>Extra practice first:</strong> {focusFriendly(path.focus_domain)}
                    </li>
                    <li>
                      <strong>Module:</strong> {path.active_module_id}
                    </li>
                  </ul>
                </div>
              </div>

              {tiers && tiers.length > 0 ? (
                <div className="path-step">
                  <span className="path-step-number">📊</span>
                  <div>
                    <h2 className="path-step-title">Skill map (from your scan)</h2>
                    <p className="path-step-text">
                      Each subject can move at its own speed — this is your starting line, not a label forever.
                    </p>
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
                      {tiers.map((t) => (
                        <li key={t.domain}>
                          <strong>{t.domain === "math" ? "Math" : "ELA"}:</strong> {tierFriendly(t.tier)} ({t.percent}
                          % on scan)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}

              {skillLines.length > 0 ? (
                <div className="path-step">
                  <span className="path-step-number">🎯</span>
                  <div>
                    <h2 className="path-step-title">Next curriculum nodes (preview)</h2>
                    <p className="path-step-text">From your global module graph — missions will attach here in a later phase.</p>
                    <ol style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem", lineHeight: 1.65 }}>
                      {skillLines.map((s) => (
                        <li key={s!.id}>
                          <strong>{s!.standard_code}</strong> — {s!.description.slice(0, 120)}
                          {s!.description.length > 120 ? "…" : ""}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}

              <p className="path-step-text" style={{ fontSize: "0.9rem" }}>
                <Link href="/learn/placement" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  Retake Mission Ready Quiz
                </Link>{" "}
                anytime — your path updates when you finish while signed in.
              </p>
            </section>
          );
        } else {
          personalized = (
            <section className="space-y-4" style={{ marginTop: "1.5rem" }}>
              <div
                className="path-step"
                style={{
                  border: "2px dashed #94a3b8",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                }}
              >
                <span className="path-step-number">!</span>
                <div>
                  <h2 className="path-step-title">No saved path yet</h2>
                  <p className="path-step-text">
                    Sign in as a <strong>student</strong>, then complete the{" "}
                    <Link href="/learn/placement" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      Mission Ready Quiz
                    </Link>
                    . We will store your ELA + Math tiers and your recommended first world.
                  </p>
                  <p className="path-step-text" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    If you already use Supabase, run <code>002_phase2_curriculum.sql</code> from{" "}
                    <code>src/data/supabase/</code> so the new tables exist.
                  </p>
                </div>
              </div>
            </section>
          );
        }
      } else {
        personalized = (
          <p className="path-step-text" style={{ marginTop: "1rem" }}>
            Learning path previews are for <strong>student</strong> accounts.{" "}
            <Link href="/account" style={{ color: "var(--accent)", fontWeight: 700 }}>
              Account
            </Link>
          </p>
        );
      }
    } else {
      personalized = (
        <p className="path-step-text" style={{ marginTop: "1rem" }}>
          <Link href="/account/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
            Sign in
          </Link>{" "}
          as a student to see your saved path after you take the Mission Ready Quiz.
        </p>
      );
    }
  }

  return (
    <main className="page-shell kid-shell">
      <section className="page-header">
        <p className="eyebrow">Learning Path</p>
        <h1 className="page-title">Your Adventure Path</h1>
        <p className="page-subtitle">A step-by-step journey that grows with your skills — not just your grade.</p>
      </section>

      {personalized}

      <section className="space-y-4" style={{ marginTop: personalized ? "2rem" : 0 }}>
        <div className="path-step">
          <span className="path-step-number">1</span>
          <div>
            <h2 className="path-step-title">Mission Ready Quiz</h2>
            <p className="path-step-text">
              A short check-in so we can start at the right level for <strong>reading</strong> and <strong>math</strong>{" "}
              separately.{" "}
              <Link href="/learn/placement" style={{ color: "var(--accent)", fontWeight: 700 }}>
                Take the quiz →
              </Link>
            </p>
          </div>
        </div>
        <div className="path-step">
          <span className="path-step-number">2</span>
          <div>
            <h2 className="path-step-title">Core skill missions</h2>
            <p className="path-step-text">
              Bite-sized missions in math, reading, and more — routed by your skill map (Phase 2 saves your starting
              line; gameplay hooks come next).
            </p>
          </div>
        </div>
        <div className="path-step">
          <span className="path-step-number">3</span>
          <div>
            <h2 className="path-step-title">Reward checkpoint</h2>
            <p className="path-step-text">Earn rewards and unlock new scenes as you progress — safely, without punishment
              loops.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
