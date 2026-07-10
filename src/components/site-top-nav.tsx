"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Gift,
  Home,
  Info,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useNavAccount } from "@/hooks/use-nav-account";
import logo from "@/assets/images/logo2026.png";

import styles from "./site-top-nav.module.css";

type NavTone = "violet" | "pink" | "sky" | "amber" | "gold";

const NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: NavTone;
}> = [
  { href: "/", label: "Home", hint: "Start your journey", icon: Home, tone: "violet" },
  { href: "/characters", label: "Characters", hint: "Meet the sisters", icon: Users, tone: "pink" },
  { href: "/episodes", label: "Adventures", hint: "Episodes & quests", icon: BookOpen, tone: "sky" },
  { href: "/parent", label: "About", hint: "Our story & mission", icon: Info, tone: "amber" },
  { href: "/rewards", label: "Rewards", hint: "Earn stars & prizes", icon: Gift, tone: "gold" },
];

const TONE_CLASS: Record<NavTone, string> = {
  violet: styles.toneViolet,
  pink: styles.tonePink,
  sky: styles.toneSky,
  amber: styles.toneAmber,
  gold: styles.toneGold,
};

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavAvatar({
  initial,
  avatarUrl,
  avatarColor,
  className,
}: {
  initial: string;
  avatarUrl: string | null;
  avatarColor: string;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <span className={`${styles.navAvatar} ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className={styles.navAvatarImage} />
      </span>
    );
  }

  return (
    <span
      className={`${styles.navAvatar} ${styles.navAvatarInitial} ${className ?? ""}`}
      style={{ background: avatarColor }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function DesktopAccountButton({ account }: { account: ReturnType<typeof useNavAccount> }) {
  if (account.loading) {
    return (
      <span className="nav-btn-secondary nav-btn-secondaryGhost" aria-hidden>
        Login
      </span>
    );
  }

  if (!account.signedIn) {
    return (
      <Link href="/account/login" className="nav-btn-secondary">
        Login
      </Link>
    );
  }

  return (
    <Link href="/account" className="nav-btn-account" aria-label={`${account.displayName} account`}>
      <NavAvatar
        initial={account.initial}
        avatarUrl={account.avatarUrl}
        avatarColor={account.avatarColor}
      />
      <span className="nav-account-name">{account.shortName}</span>
    </Link>
  );
}

function MobileAccountButton({ account }: { account: ReturnType<typeof useNavAccount> }) {
  if (account.loading) return null;

  if (!account.signedIn) {
    return (
      <Link href="/account/login" className={styles.mobileLoginBtn}>
        Login
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      className={styles.mobileAccountBtn}
      aria-label={`${account.displayName} account`}
    >
      <NavAvatar
        initial={account.initial}
        avatarUrl={account.avatarUrl}
        avatarColor={account.avatarColor}
        className={styles.mobileAccountAvatar}
      />
    </Link>
  );
}

export function SiteTopNav() {
  const pathname = usePathname();
  const account = useNavAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link href="/" className="top-nav-left">
            <span className="nav-logo-wrap">
              <Image
                src={logo}
                alt="Allen Girls Adventures"
                width={64}
                height={64}
                priority
                className="nav-logo-img"
              />
            </span>
            <div className="brand-text">
              <div className="brand-name">Allen Girls Adventures</div>
              <div className="brand-tagline">Bold Girls. Big Adventures.</div>
            </div>
          </Link>

          <div className="top-nav-right">
            <nav className="top-nav-links top-nav-links-desktop" aria-label="Main">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
              <div className="top-nav-cta-group">
                <DesktopAccountButton account={account} />
                <Link href="/learn" className="nav-btn-primary">
                  <span className="nav-cta-long">Join the Fun!</span>
                  <span className="nav-cta-short">Join!</span>
                </Link>
              </div>
            </nav>

            <div className="top-nav-mobile-actions">
              <MobileAccountButton account={account} />
              <button
                type="button"
                className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                aria-controls="site-mobile-nav"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <X size={22} strokeWidth={2.25} aria-hidden />
                ) : (
                  <Menu size={22} strokeWidth={2.25} aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className={`${styles.overlay} ${styles.overlayOpen}`} aria-hidden={false}>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />

          <aside
            id="site-mobile-nav"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className={styles.drawerGlow} aria-hidden />
            <div className={styles.drawerSparkle} aria-hidden>
              ✨
            </div>

            <div className={styles.drawerHead}>
              <div className={styles.drawerBrand}>
                <span className={styles.drawerLogoWrap}>
                  <Image
                    src={logo}
                    alt=""
                    width={52}
                    height={52}
                    className={styles.drawerLogo}
                  />
                </span>
                <div className={styles.drawerBrandText}>
                  <p className={styles.drawerKicker}>Allen Girls Adventures</p>
                  <p className={styles.drawerTitle}>Explore</p>
                  <p className={styles.drawerTagline}>Bold Girls. Big Adventures.</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <X size={18} strokeWidth={2.5} aria-hidden />
              </button>
            </div>

            <nav className={styles.drawerNav} aria-label="Mobile">
              <p className={styles.drawerSectionLabel}>Navigate</p>
              <div className={styles.drawerLinkList}>
                {NAV_LINKS.map((item, index) => {
                  const Icon = item.icon;
                  const active = isNavLinkActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.drawerLink} ${TONE_CLASS[item.tone]} ${
                        active ? styles.drawerLinkActive : ""
                      }`}
                      style={{ animationDelay: `${index * 45}ms` }}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMenu}
                    >
                      <span className={styles.drawerLinkIcon} aria-hidden>
                        <Icon size={19} strokeWidth={2.1} />
                      </span>
                      <span className={styles.drawerLinkCopy}>
                        <span className={styles.drawerLinkLabel}>{item.label}</span>
                        <span className={styles.drawerLinkHint}>{item.hint}</span>
                      </span>
                      <ChevronRight className={styles.drawerLinkArrow} size={18} aria-hidden />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className={styles.drawerFooter}>
              {!account.loading && account.signedIn ? (
                <Link href="/account" className={styles.drawerAccount} onClick={closeMenu}>
                  <NavAvatar
                    initial={account.initial}
                    avatarUrl={account.avatarUrl}
                    avatarColor={account.avatarColor}
                    className={styles.drawerAccountAvatar}
                  />
                  <span className={styles.drawerAccountCopy}>
                    <span className={styles.drawerAccountLabel}>{account.displayName}</span>
                    <span className={styles.drawerAccountHint}>Open your account hub</span>
                  </span>
                  <ChevronRight className={styles.drawerLinkArrow} size={18} aria-hidden />
                </Link>
              ) : (
                <Link href="/account/login" className={styles.drawerLogin} onClick={closeMenu}>
                  Login
                </Link>
              )}

              <p className={styles.drawerFooterNote}>
                Ready to learn, play, and earn rewards?
              </p>
              <Link href="/learn" className={styles.drawerCta} onClick={closeMenu}>
                <Sparkles size={18} strokeWidth={2.25} aria-hidden />
                Join the Fun!
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
