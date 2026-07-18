"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/worlds", label: "Learn" },
  { href: "/courses", label: "Courses" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/quests", label: "Quests" },
  { href: "/shop", label: "Shop" },
] as const;

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full w-[256px] flex-col gap-2 border-r bg-white p-4",
        className,
      )}
    >
      <Link href="/" className="mb-4 text-xl font-bold text-lime-600">
        AGA
      </Link>
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-lime-100 text-lime-800"
                : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
