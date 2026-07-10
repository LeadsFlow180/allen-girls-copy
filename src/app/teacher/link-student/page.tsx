"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import educator from "@/components/account/teacher-educator.module.css";

export default function TeacherLinkStudentPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/teacher/link-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setStatus("success");
        setMessage("Student linked! They will now appear in your classroom dashboard.");
        setCode("");
      } else {
        setStatus("error");
        setMessage(typeof json.error === "string" ? json.error : "Could not link student.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "28rem", margin: "0 auto" }}>
      <div className={educator.panelCard}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
          <span className={educator.actionIconWrap}>
            <UserPlus size={22} aria-hidden />
          </span>
        </div>
        <h1 className={`font-fredoka ${educator.formTitle}`}>Add a student</h1>
        <p className={`font-nunito ${educator.formLead}`}>
          Ask the student for their approval code from their account page, then enter it below.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <label className={`font-nunito ${educator.fieldLabel}`}>Student code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD34"
            maxLength={20}
            className={`font-nunito ${educator.fieldInput}`}
            style={{ textAlign: "center", fontWeight: 700, letterSpacing: "0.1em" }}
          />

          <button type="submit" disabled={status === "loading" || !code.trim()} className={`font-nunito ${educator.submitBtn}`}>
            {status === "loading" ? "Linking…" : "Link student"}
          </button>
        </form>

        {status === "success" ? (
          <div className={educator.alertSuccess}>
            <p className="font-nunito" style={{ margin: 0 }}>{message}</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className={educator.alertError}>
            <p className="font-nunito" style={{ margin: 0 }}>{message}</p>
          </div>
        ) : null}

        <div className={educator.formFooter}>
          <Link href="/teacher/dashboard" className={`font-nunito ${educator.formFooterLink}`}>
            Classroom dashboard
          </Link>
          <Link href="/account" className={`font-nunito ${educator.formFooterLinkMuted}`}>
            Educator home
          </Link>
        </div>
      </div>
    </div>
  );
}
