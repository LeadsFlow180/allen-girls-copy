"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { LibraryNovel } from "@/lib/library/library-catalog";

import { LibraryPageReader } from "./library-page-reader";

const LibraryPdfReader = dynamic(
  () => import("./library-pdf-reader").then((m) => m.LibraryPdfReader),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", textAlign: "center", color: "#e9d5ff" }}>
        Opening book…
      </div>
    ),
  },
);

type Props = {
  novel: LibraryNovel;
  onClose: () => void;
  mode?: "text" | "pdf";
};

export function LibraryReader({ novel, onClose, mode: initialMode = "text" }: Props) {
  const [mode, setMode] = useState<"text" | "pdf">(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [novel.id, initialMode]);

  if (mode === "pdf") {
    return (
      <LibraryPdfReader
        novel={novel}
        onClose={onClose}
        onReadOnline={() => setMode("text")}
      />
    );
  }

  return <LibraryPageReader novel={novel} onClose={onClose} />;
}
