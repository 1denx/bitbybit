"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  RefreshCcw,
  Target,
  ListCheck,
  History,
  LogOut,
  User,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "儀表板", icon: LayoutDashboard },
  { href: "/cycles", label: "週期", icon: RefreshCcw },
  { href: "/goals", label: "目標", icon: Target },
  { href: "/tasks/week", label: "任務", icon: ListCheck },
  { href: "/history", label: "歷史", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { displayName, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("已登出");
  };

  const isActive = (href: string) => {
    if (href === "/tasks/week") return pathname.startsWith("/tasks");
    return pathname === href;
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r transition-all duration-200",
        collapsed ? "w-14" : "w-50",
      )}
    >
      {/* 收合按鈕 */}
      <div className="flex justify-end border border-white/10 p-2">
        <Button variant="ghost" onClick={() => setCollapsed(!collapsed)} className="text-zinc-500 ">
          <ChevronLeft
            size={15}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      {/* 使用者資訊 */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-white/10 px-4 py-4",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-zinc-200">
          <User size={15} className="text-zinc-700" />
        </div>
        {!collapsed && (
          <span className="truncate text-sm text-zinc-600 font-semibold">{displayName}</span>
        )}
      </div>

      {/* 導覽項目 */}
      <nav className="flex flex-col flex-1 gap-2 p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors rounded-md",
              collapsed && "justify-center px-0",
              isActive(href)
                ? "bg-zinc-200 text-zinc-700 font-semibold"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 font-normal",
            )}
          >
            <Icon size={15} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* 底部 */}
      <div className="flex flex-col gap-2 border-t border-white/10 p-2">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 rounded-md",
            collapsed && "justify-center px-0",
          )}
        >
          <User size={15} />
          {!collapsed && <span>會員</span>}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-500 transition-colors cursor-pointer hover:bg-zinc-100 hover:text-zinc-700 rounded-md",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut size={15} />
          {!collapsed && <span>登出</span>}
        </button>
      </div>
    </aside>
  );
}
