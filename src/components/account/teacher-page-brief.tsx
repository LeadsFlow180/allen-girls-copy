"use client";

import { usePathname } from "next/navigation";

import { getActiveHubItem } from "@/lib/auth/account-hub-nav";

import educator from "./teacher-educator.module.css";

/** Slim contextual header — hidden on pages that bring their own hero. */
export function TeacherPageBrief() {
  const pathname = usePathname();

  if (pathname === "/account" || pathname.startsWith("/teacher/dashboard")) {
    return null;
  }

  const active = getActiveHubItem("teacher", pathname);

  return (
    <aside className={educator.pageBrief}>
      <span className={`font-nunito ${educator.pageBriefTag}`}>Educator tools</span>
      <h1 className={`font-fredoka ${educator.pageBriefTitle}`}>{active.pageTitle}</h1>
      <p className={`font-nunito ${educator.pageBriefLead}`}>{active.pageLead}</p>
    </aside>
  );
}
