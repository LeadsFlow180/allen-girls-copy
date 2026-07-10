"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { LearnAmbientBackground } from "@/components/learn/learn-ambient-background";
import { LearnClickSoundLayer } from "@/components/learn/learn-click-sound-layer";
import { LearnSidebar } from "@/components/learn-sidebar";
import frameStyles from "./learn-page-frame.module.css";
import sidebarStyles from "./learn-sidebar.module.css";

type LearnPageFrameTab =
  | "learn"
  | "courses"
  | "achievements"
  | "quests"
  | "leaderboards"
  | "shop";

export type LearnPageFrameProps = {
  activeTab: LearnPageFrameTab;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  profileInitial?: string;
  profileDisplayName?: string;
  profileRole?: string | null;
};

export function LearnPageFrame({
  activeTab,
  children,
  className,
  style,
  profileInitial,
  profileDisplayName,
  profileRole,
}: LearnPageFrameProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  return (
    <div
      className={`${frameStyles.page}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <LearnAmbientBackground />
      <LearnClickSoundLayer className={frameStyles.shell}>
        {mobileNavOpen ? (
          <button
            type="button"
            className={frameStyles.sidebarBackdrop}
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <div className={frameStyles.main}>
          <div className={frameStyles.mobileBar}>
            <button
              type="button"
              className={frameStyles.menuToggle}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={22} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <div className={frameStyles.content}>{children}</div>
        </div>

        <div
          className={`${frameStyles.sidebarWrap} ${
            mobileNavOpen ? frameStyles.sidebarWrapOpen : ""
          }`.trim()}
        >
          <LearnSidebar
            activeTab={activeTab}
            profileInitial={profileInitial}
            profileDisplayName={profileDisplayName}
            profileRole={profileRole}
            railClassName={sidebarStyles.railMobileDrawer}
          />
        </div>
      </LearnClickSoundLayer>
    </div>
  );
}
