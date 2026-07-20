import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LibraryImmersiveBody } from "@/components/library/library-immersive-body";

export const metadata: Metadata = {
  title: "Story Library for Grades 3–6 — Read-Along Adventures",
  description:
    "A growing library of original, read-along stories for grades 3–6 — where reading practice feels like the next chapter of the adventure, not homework.",
  alternates: { canonical: "/learn/library" },
};

import "./library-page.css";
import styles from "./library-layout.module.css";

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('store-immersive','library-immersive');",
        }}
      />
      <LibraryImmersiveBody />
      {children}
    </div>
  );
}
