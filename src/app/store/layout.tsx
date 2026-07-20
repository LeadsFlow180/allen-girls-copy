import type { Metadata } from "next";
import type { ReactNode } from "react";

import { StoreImmersiveBody } from "@/components/store/store-immersive-body";

import styles from "./store-layout.module.css";

export const metadata: Metadata = {
  title: "Store — Rewards, Prizes & Extras for Grades 3–6",
  description:
    "Spend the stars you earn on adventures. The Allen Girls Adventures store rewards real learning progress with prizes kids actually want.",
  alternates: { canonical: "/store" },
};

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* Apply before paint so marketing nav never flashes over the boutique */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('store-immersive');",
        }}
      />
      <StoreImmersiveBody />
      {children}
    </div>
  );
}
