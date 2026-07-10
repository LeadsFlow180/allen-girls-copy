import Image, { type StaticImageData } from "next/image";

import { AuthCard } from "@/components/auth/auth-card";
import styles from "@/components/auth/auth-shell.module.css";

type AuthShellProps = {
  mode: "login" | "signup";
  title: string;
  subtitle: string;
  artwork: StaticImageData;
  background: StaticImageData;
};

export const AuthShell = ({ mode, title, subtitle, artwork, background: _background }: AuthShellProps) => {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.leftPanel}>
          <div className={styles.artFrame}>
            <Image
              src={artwork}
              alt="Allen Girls Adventures"
              fill
              priority
              className={styles.sidebarImage}
            />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <p className={styles.eyebrow}>Join the Fun</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.cardWrap}>
            <AuthCard mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
};
