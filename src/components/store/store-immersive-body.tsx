"use client";

import { useEffect } from "react";

/** Hides site chrome so the boutique is full-screen. */
export function StoreImmersiveBody() {
  useEffect(() => {
    document.body.classList.add("store-immersive");
    return () => {
      document.body.classList.remove("store-immersive");
    };
  }, []);

  return null;
}
