import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";

import { AccountAuthPortalBackdrop } from "./account-auth-portal-backdrop";

import styles from "./account-auth-shell.module.css";

type AccountAuthShellProps = {
  heroImage: StaticImageData;
  heroAlt: string;
  heroBadge?: string;
  children: ReactNode;
};

export function AccountAuthShell({
  heroImage,
  heroAlt,
  heroBadge = "Allen Girls Adventures",
  children,
}: AccountAuthShellProps) {
  return (
    <div className={styles.page}>
      <AccountAuthPortalBackdrop />

      <div className={styles.shell}>
        <aside className={styles.heroPanel} aria-hidden={false}>
          <div className={styles.heroBadge}>{heroBadge}</div>
          <div className={styles.heroFrame}>
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 42vw"
              className={styles.heroImage}
            />
            <div className={styles.heroGlow} aria-hidden />
          </div>
          <p className={styles.heroCaption}>Bold Girls. Big Adventures.</p>
        </aside>

        <div className={styles.formPanel}>{children}</div>
      </div>
    </div>
  );
}
