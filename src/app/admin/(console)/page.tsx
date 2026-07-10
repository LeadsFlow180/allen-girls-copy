"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cpu, Gamepad2, GraduationCap, Library, Users } from "lucide-react";

import { SuperAdminUsersPanel } from "@/components/admin/super-admin-users-panel";

import styles from "./admin-home.module.css";

type AiHealth = {
  ok: boolean;
  anthropicConfigured: boolean;
  defaultModel: string;
  hint: string;
};

const QUICK_LINKS = [
  { href: "/admin/library", label: "Library manager", desc: "Upload & edit stories", icon: Library },
  { href: "/learn/library", label: "Learner library", desc: "Preview reading view", icon: GraduationCap },
  { href: "/teacher/dashboard", label: "Teacher dashboard", desc: "Educator classroom view", icon: Users },
  { href: "/parent/dashboard", label: "Guardian dashboard", desc: "Family progress view", icon: Users },
  { href: "/games", label: "Games", desc: "Game zone", icon: Gamepad2 },
] as const;

export default function SuperAdminHomePage() {
  const [health, setHealth] = useState<AiHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/health")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((data: AiHealth) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`font-nunito ${styles.kicker}`}>Platform control</p>
        <h1 className={`font-fredoka ${styles.title}`}>Super Admin overview</h1>
        <p className={`font-nunito ${styles.lead}`}>
          Manage every user, review learning progress, and control the story library. Teachers can
          no longer upload or edit stories — that lives here.
        </p>
      </header>

      <div className={styles.quickGrid}>
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={styles.quickCard}>
              <span className={styles.quickIcon} aria-hidden>
                <Icon size={18} />
              </span>
              <span>
                <span className={`font-nunito ${styles.quickLabel}`}>{item.label}</span>
                <span className={`font-nunito ${styles.quickDesc}`}>{item.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <section className={styles.statusCard} aria-labelledby="system-status-heading">
        <div className={styles.statusHead}>
          <span className={styles.statusIcon} aria-hidden>
            <Cpu size={18} />
          </span>
          <div>
            <h2 id="system-status-heading" className={`font-fredoka ${styles.statusTitle}`}>
              System status
            </h2>
            <p className={`font-nunito ${styles.statusSub}`}>AI helper configuration</p>
          </div>
        </div>
        {health ? (
          <p className={`font-nunito ${styles.statusLine}`}>
            Anthropic key:{" "}
            <strong>{health.anthropicConfigured ? "Configured" : "Not set"}</strong> · Model:{" "}
            {health.defaultModel}
          </p>
        ) : (
          <p className={`font-nunito ${styles.statusSub}`}>Checking…</p>
        )}
      </section>

      <SuperAdminUsersPanel />
    </div>
  );
}
