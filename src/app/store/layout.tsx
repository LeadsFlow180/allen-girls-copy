import type { ReactNode } from "react";

import { StoreImmersiveBody } from "@/components/store/store-immersive-body";

import styles from "./store-layout.module.css";

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
