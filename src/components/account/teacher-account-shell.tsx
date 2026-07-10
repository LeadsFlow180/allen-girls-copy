import { GraduationCap } from "lucide-react";

import { TeacherAccountNav } from "@/components/account/teacher-account-nav";
import { TeacherEducatorBackdrop } from "@/components/account/teacher-educator-backdrop";
import { TeacherPageBrief } from "@/components/account/teacher-page-brief";
import { TeacherSignOutButton } from "@/components/account/teacher-sign-out-button";

import educator from "./teacher-educator.module.css";

type Props = {
  email: string;
  children: React.ReactNode;
};

/** Server layout for teacher routes — Educator Hub shell. */
export function TeacherAccountShell({ children }: Props) {
  return (
    <div className={educator.educatorPage}>
      <TeacherEducatorBackdrop />
      <div className={educator.educatorShell}>
        <header className={educator.topBar}>
          <div className={educator.topBarMain}>
            <div className={educator.brandBlock}>
              <span className={educator.brandIconWrap} aria-hidden>
                <GraduationCap size={20} strokeWidth={2.25} />
              </span>
              <div>
                <p className={`font-nunito ${educator.brandKicker}`}>Allen Girls Adventures</p>
                <h2 className={`font-fredoka ${educator.brandTitle}`}>Educator Hub</h2>
              </div>
            </div>
            <div className={educator.topBarActions}>
              <span className={`font-nunito ${educator.educatorBadge}`}>Educator</span>
              <TeacherSignOutButton className={educator.signOutBtn} />
            </div>
          </div>
          <TeacherAccountNav />
        </header>

        <TeacherPageBrief />
        <main className={educator.contentStage}>{children}</main>
      </div>
    </div>
  );
}

/** @deprecated Use TeacherAccountShell */
export const TeacherHubShell = TeacherAccountShell;
