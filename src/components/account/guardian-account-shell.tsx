"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

import { GuardianAccountNav } from "@/components/account/guardian-account-nav";
import { GuardianFamilyControlsBackdrop } from "@/components/account/guardian-family-controls-backdrop";
import { GuardianPageBrief } from "@/components/account/guardian-page-brief";
import { GuardianSignOutButton } from "@/components/account/guardian-sign-out-button";

import guardian from "./guardian-family-controls.module.css";

type Props = {
  children: React.ReactNode;
};

/** Family Controls shell — single unified hub card. */
export function GuardianAccountShell({ children }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/account";

  return (
    <div className={guardian.guardianPage}>
      <GuardianFamilyControlsBackdrop />
      <div className={guardian.guardianShell}>
        <div className={guardian.hubFrame}>
          <header className={guardian.hubHeader}>
            <div className={guardian.brandBlock}>
              <span className={guardian.brandIconWrap} aria-hidden>
                <Shield size={20} strokeWidth={2.25} />
              </span>
              <div>
                <p className={guardian.brandKicker}>Allen Girls Adventures</p>
                <h2 className={guardian.brandTitle}>Family Controls</h2>
              </div>
            </div>
            <div className={guardian.topBarActions}>
              <span className={guardian.guardianBadge}>Guardian account</span>
              <GuardianSignOutButton />
            </div>
          </header>

          <GuardianAccountNav />
          <GuardianPageBrief />
          <main className={`${guardian.hubBody} ${!isHome ? guardian.hubBodyPad : ""}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use GuardianAccountShell */
export const GuardianHubShell = GuardianAccountShell;
