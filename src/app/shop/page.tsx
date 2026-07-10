"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import { LearnPageFrame } from "@/components/learn-page-frame";
import { LearnStatsBar } from "@/components/learn/learn-stats-bar";
import { ShopHub } from "@/components/learn/shop-hub";
import { useLearnProgress } from "@/lib/learn/use-learn-progress";
import styles from "@/app/learn/shop/page.module.css";

const ACTIVE_LANGUAGE_STORAGE_KEY = "learn.activeLanguage";

const LANGUAGES = [
  { code: "es", label: "Spanish", countryCode: "ES" },
  { code: "fr", label: "French", countryCode: "FR" },
  { code: "ar", label: "Arabic", countryCode: "SA" },
  { code: "ur", label: "Urdu", countryCode: "PK" },
  { code: "en", label: "English", countryCode: "GB" },
];

function readActiveLanguage(): string {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY) ?? "es";
}

export default function ShopPage() {
  const router = useRouter();
  const { streakDays, wallet } = useLearnProgress();
  const [activeLanguage, setActiveLanguage] = useState("es");

  useEffect(() => {
    setActiveLanguage(readActiveLanguage());
  }, []);

  return (
    <LearnPageFrame activeTab="shop">
      <div className={styles.shell}>
        <header className={`${styles.header} font-nunito`}>
          <button
            type="button"
            onClick={() => router.push("/learn/explore")}
            className={styles.mapBtn}
          >
            ← Map
          </button>
          <LearnStatsBar
            streakDays={streakDays}
            gems={wallet.gems}
            onStreakViewMore={() => router.push("/learn/quests")}
            before={
              <button
                type="button"
                className={styles.langBadge}
                aria-label="Active course language"
              >
                <ReactCountryFlag
                  countryCode={
                    LANGUAGES.find((l) => l.code === activeLanguage)
                      ?.countryCode ?? "ES"
                  }
                  svg
                  style={{
                    width: "1.6rem",
                    height: "1.1rem",
                    borderRadius: 4,
                    boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
                  }}
                />
              </button>
            }
          />
        </header>

        <ShopHub />
      </div>
    </LearnPageFrame>
  );
}
