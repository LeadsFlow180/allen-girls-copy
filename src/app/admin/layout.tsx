import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin | Allen Girls Adventures",
  description: "Platform administration — users, library, and operations.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
