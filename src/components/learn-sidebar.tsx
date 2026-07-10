"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Compass,
  Ellipsis,
  GraduationCap,
  ListChecks,
  Lock,
  Map,
  ShoppingBag,
  Star,
  Trophy,
  User,
  type LucideProps,
} from "lucide-react";
import exploreGameBg from "@/assets/images/learn/explore-game-background.png";

import { useAchievementPulse } from "@/lib/learn/use-achievement-pulse";
import { useLearnLeaderboard } from "@/lib/learn/use-learn-leaderboard";
import { useQuestPulse } from "@/lib/learn/use-quest-pulse";

import styles from "./learn-sidebar.module.css";

type LearnSidebarTab =
  | "learn"
  | "courses"
  | "achievements"
  | "quests"
  | "leaderboards"
  | "shop";

type LearnSidebarProps = {
  activeTab: LearnSidebarTab;
  profileInitial?: string;
  profileDisplayName?: string;
  profileRole?: string | null;
  railClassName?: string;
};

type NavItemId =
  | LearnSidebarTab
  | "leaderboards"
  | "shop"
  | "profile"
  | "more";

type NavIconComponent = ComponentType<LucideProps>;

type NavItem = {
  id: NavItemId;
  label: string;
  hint: string;
  href?: string;
  disabled?: boolean;
  Icon: NavIconComponent;
};

const ICON_SIZE = 18;

function navIconColor(active: boolean, disabled?: boolean): string {
  if (active) return "#ffffff";
  if (disabled) return "#94a3b8";
  return "#475569";
}

function isItemActive(
  item: NavItem,
  activeTab: LearnSidebarTab,
  pathname: string,
): boolean {
  if (item.id === "profile") return pathname.startsWith("/account");
  if (item.id === "shop") {
    return (
      activeTab === "shop" ||
      pathname === "/shop" ||
      pathname.startsWith("/shop/") ||
      pathname.startsWith("/learn/shop")
    );
  }
  if (item.id === "leaderboards") {
    return activeTab === "leaderboards" || pathname.startsWith("/learn/leaderboard");
  }
  return item.id === activeTab;
}

function NavIcon({
  Icon,
  active,
  disabled,
}: {
  Icon: NavIconComponent;
  active: boolean;
  disabled?: boolean;
}) {
  const color = navIconColor(active, disabled);
  const fill =
    Icon === Trophy && active ? "#fde047" : "transparent";

  return (
    <Icon
      size={ICON_SIZE}
      strokeWidth={2}
      color={color}
      fill={fill}
      aria-hidden
    />
  );
}

function NavRow({
  item,
  active,
  onClick,
  claimCount = 0,
  profileInitial,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  claimCount?: number;
  profileInitial?: string;
}) {
  const disabled = item.disabled;
  const isProfile = item.id === "profile" && profileInitial;
  const showClaim =
    (item.id === "achievements" || item.id === "quests") && claimCount > 0;

  const linkClass = [
    styles.navLink,
    active ? styles.navLinkActive : "",
    disabled ? styles.navLinkDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-ui-sound="tap"
      className={`${linkClass} font-nunito`}
      aria-label={item.hint ? `${item.label} — ${item.hint}` : item.label}
      aria-current= {active ? "page" : undefined}
      title={item.hint}
    >
      <span className={styles.iconWrap}>
        <span
          className={`${styles.iconBox} ${isProfile ? styles.iconBoxProfile : ""}`}
        >
          {isProfile ? (
            profileInitial
          ) : (
            <NavIcon Icon={item.Icon} active={active} disabled={disabled} />
          )}
        </span>
        {disabled ? (
          <span className={styles.lockOnIcon} aria-hidden>
            <Lock size={7} color="#94a3b8" strokeWidth={2.5} />
          </span>
        ) : null}
      </span>
      <span className={styles.navLabel}>{item.label}</span>
      {active ? (
        <span className={styles.activeDot} aria-hidden />
      ) : disabled ? (
        <span className={`${styles.soonTag} font-nunito`}>Soon</span>
      ) : showClaim ? (
        <span className={styles.claimBadge}>{claimCount > 9 ? "9+" : claimCount}</span>
      ) : (
        <span className={styles.navSpacer} aria-hidden />
      )}
    </button>
  );
}

function SidebarWorld() {
  return (
    <div className={styles.worldLayer} aria-hidden>
      <Image
        src={exploreGameBg}
        alt=""
        fill
        className={styles.worldBg}
        sizes="200px"
      />
      <div className={styles.worldVignette} />
      <div className={styles.worldPattern} />
      <span className={styles.hillBack} />
      <span className={styles.hillFront} />
      <span className={styles.decorSun} />
      <span className={`${styles.decorCloud} ${styles.decorCloudA}`} />
      <span className={`${styles.decorCloud} ${styles.decorCloudB}`} />
    </div>
  );
}

function NavSection({
  title,
  SectionIcon,
  children,
}: {
  title: string;
  SectionIcon: NavIconComponent;
  children: ReactNode;
}) {
  return (
    <div className={styles.navSection}>
      <p className={styles.sectionSign}>
        <span className={styles.sectionIconWrap} aria-hidden>
          <SectionIcon size={11} strokeWidth={2.25} color="#92400e" />
        </span>
        {title}
      </p>
      <div className={styles.sectionItems}>{children}</div>
    </div>
  );
}

export function LearnSidebar({
  activeTab,
  profileInitial = "A",
  profileDisplayName = "Allen Girls",
  profileRole = null,
  railClassName = "",
}: LearnSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pulse = useAchievementPulse();
  const questReady = useQuestPulse();
  const leaderboard = useLearnLeaderboard();
  const leaderboardUnlocked = leaderboard.hydrated && leaderboard.unlocked;
  const lessonsUntilLeaderboard = leaderboard.lessonsUntilUnlock;

  const learningItems: NavItem[] = [
    {
      id: "learn",
      label: "Explore",
      hint: "Learning path & missions",
      Icon: Map,
      href: "/learn/explore",
    },
    {
      id: "courses",
      label: "Courses",
      hint: "Pick a language",
      Icon: GraduationCap,
      href: "/learn/courses",
    },
  ];

  const progressItems: NavItem[] = [
    {
      id: "achievements",
      label: "Trophies",
      hint: "Badges & rewards",
      Icon: Trophy,
      href: "/learn/achievements",
    },
    {
      id: "quests",
      label: "Quests",
      hint: "Daily goals",
      Icon: ListChecks,
      href: "/learn/quests",
    },
    {
      id: "leaderboards",
      label: "Leaderboard",
      hint: leaderboardUnlocked
        ? "See how you rank"
        : `${lessonsUntilLeaderboard} lessons to unlock`,
      Icon: BarChart3,
      href: "/learn/leaderboard",
    },
  ];

  const accountItems: NavItem[] = [
    {
      id: "profile",
      label: "Profile",
      hint: profileRole ? profileRole : "Account & settings",
      Icon: User,
      href: "/account",
    },
    {
      id: "shop",
      label: "Shop",
      hint: "Gems, badges & boosts",
      Icon: ShoppingBag,
      href: "/shop",
    },
    {
      id: "more",
      label: "More",
      hint: "Coming later",
      Icon: Ellipsis,
      disabled: true,
    },
  ];

  const renderItem = (item: NavItem) => (
    <NavRow
      key={item.id}
      item={item}
      active={isItemActive(item, activeTab, pathname)}
      claimCount={
        item.id === "achievements"
          ? pulse.ready
          : item.id === "quests"
            ? questReady
            : 0
      }
      profileInitial={item.id === "profile" ? profileInitial : undefined}
      onClick={
        item.href && !item.disabled ? () => router.push(item.href!) : undefined
      }
    />
  );

  return (
    <aside className={`${styles.rail} ${railClassName}`.trim()}>
      <SidebarWorld />

      <div className={styles.body}>
        <nav className={styles.navPanel} aria-label="Learn navigation">
          <div className={styles.mapSign}>
            <Compass
              size={14}
              strokeWidth={2.25}
              color="#fef3c7"
              className={styles.mapSignIcon}
              aria-hidden
            />
            <span className={styles.mapSignTitle}>Adventure Map</span>
          </div>

          <div className={styles.navStack}>
            <NavSection title="Learn" SectionIcon={Compass}>
              {learningItems.map(renderItem)}
            </NavSection>

            <NavSection title="Progress" SectionIcon={Star}>
              {progressItems.map(renderItem)}
            </NavSection>

            <NavSection title="Account" SectionIcon={User}>
              {accountItems.map(renderItem)}
            </NavSection>
          </div>
        </nav>
      </div>
    </aside>
  );
}
