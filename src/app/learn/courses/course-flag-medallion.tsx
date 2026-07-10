"use client";

import type { CSSProperties } from "react";
import ReactCountryFlag from "react-country-flag";
import { Users } from "lucide-react";
import styles from "./course-flag-medallion.module.css";

type CourseFlagMedallionProps = {
  countryCode: string;
  languageCode: string;
  accent: string;
  learners?: string;
};

/** Hero passport medallion — flag fills a 3:2 viewport with cover + slight scale */
export function CourseFlagMedallion({
  countryCode,
  languageCode,
  accent,
  learners,
}: CourseFlagMedallionProps) {
  const accentStyle = { "--accent": accent } as CSSProperties;
  const codeLabel = languageCode.toUpperCase().slice(0, 2);

  return (
    <div className={styles.wrap} style={accentStyle}>
      <div className={styles.orbit} aria-hidden>
        <span className={styles.orbitInner} />
      </div>
      <div className={styles.seal} aria-hidden />
      <div className={styles.medallion}>
        <div className={styles.viewport}>
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            aria-label={`${languageCode} flag`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: "center",
              transform: "scale(1.06)",
            }}
          />
        </div>
        <span className={`${styles.codeBadge} font-nunito`}>{codeLabel}</span>
      </div>
      {learners ? (
        <p className={`${styles.learnersPill} font-nunito`}>
          <Users size={13} strokeWidth={2.5} aria-hidden />
          {learners} learners
        </p>
      ) : null}
    </div>
  );
}

type CourseFlagChipProps = {
  countryCode: string;
  accent: string;
};

/** Compact filled flag for course grid cards */
export function CourseFlagChip({ countryCode, accent }: CourseFlagChipProps) {
  return (
    <span
      className={styles.chipWrap}
      style={{ "--accent": accent } as CSSProperties}
    >
      <span className={styles.chipViewport}>
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            objectPosition: "center",
            transform: "scale(1.08)",
          }}
        />
      </span>
    </span>
  );
}
