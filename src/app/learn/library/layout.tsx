import type { ReactNode } from "react";

import { LibraryImmersiveBody } from "@/components/library/library-immersive-body";

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
