"use client";

import { usePathname } from "next/navigation";

import { getActiveHubItem } from "@/lib/auth/account-hub-nav";

import guardian from "./guardian-family-controls.module.css";

/** Slim contextual header — hidden on pages that bring their own content. */
export function GuardianPageBrief() {
  const pathname = usePathname();

  if (pathname === "/account") {
    return null;
  }

  if (
    pathname === "/parent/children" ||
    pathname === "/account/approve-learner" ||
    pathname.startsWith("/parent/dashboard") ||
    pathname.startsWith("/parent/reports")
  ) {
    return null;
  }

  const active = getActiveHubItem("parent", pathname);

  return (
    <aside className={guardian.pageBrief}>
      <span className={guardian.pageBriefTag}>Family Controls</span>
      <h1 className={guardian.pageBriefTitle}>{active.pageTitle}</h1>
      <p className={guardian.pageBriefLead}>{active.pageLead}</p>
    </aside>
  );
}
