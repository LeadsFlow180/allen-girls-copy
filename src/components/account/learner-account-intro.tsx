"use client";

import { usePathname } from "next/navigation";

import { getActiveHubItem } from "@/lib/auth/account-hub-nav";

import studio from "./learner-account-studio.module.css";

type Props = {
  studentPending?: boolean;
};

export function LearnerAccountIntro({ studentPending = false }: Props) {
  const pathname = usePathname();
  if (pathname === "/account") return null;

  const active = getActiveHubItem("student", pathname, studentPending);

  return (
    <header className={studio.pageIntro}>
      <h1 className={studio.pageTitle}>{active.pageTitle}</h1>
      <p className={studio.pageLead}>{active.pageLead}</p>
    </header>
  );
}
