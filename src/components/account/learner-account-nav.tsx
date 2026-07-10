"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getHubNavForRole,
  isHubNavItemActive,
} from "@/lib/auth/account-hub-nav";
import { LearnerHubNavIcon } from "@/components/account/learner-hub-nav-icon";

import studio from "./learner-account-studio.module.css";

type Props = {
  studentPending?: boolean;
};

export function LearnerAccountNav({ studentPending = false }: Props) {
  const pathname = usePathname();
  const nav = getHubNavForRole("student", { studentPending });

  return (
    <nav className={studio.tabNav} aria-label="Learner navigation">
      {nav.map((item) => {
        const activeTab = isHubNavItemActive(pathname, item, "student");
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${studio.tabLink} ${activeTab ? studio.tabLinkActive : ""}`}
            aria-current={activeTab ? "page" : undefined}
          >
            <LearnerHubNavIcon navId={item.id} className={studio.tabIcon} />
            <span className={studio.tabLinkLabel}>{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
