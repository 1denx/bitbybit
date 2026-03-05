"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  CalendarRange,
  CalendarCheck,
  Columns3,
  LayoutGrid,
  ChartColumnIncreasing,
} from "lucide-react";

const tabItems = [
  { href: "/tasks/week", label: "本週", icon: CalendarRange },
  { href: "/tasks/today", label: "今日", icon: CalendarCheck },
  { href: "/tasks/board", label: "看板", icon: Columns3 },
  { href: "/tasks/matrix", label: "矩陣", icon: LayoutGrid },
  { href: "/tasks/review", label: "回顧", icon: ChartColumnIncreasing },
];

export function TasksTabNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 bg-zinc-100 rounded-lg p-1">
      {tabItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap",
            pathname === href
              ? "bg-white text-zinc-900 shadow-sm font-medium"
              : "text-zinc-500 hover:text-zinc-700",
          )}
        >
          <Icon size={13} />
          {label}
        </Link>
      ))}
    </div>
  );
}
