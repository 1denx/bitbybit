"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  LayoutDashboard,
  RefreshCcw,
  Target,
  ListCheck,
  History,
  LogOut,
  User,
  ChevronLeft,
  Bell,
  List,
  TriangleAlert,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/client";
import { format } from "date-fns";

const navItems = [
  { href: "/dashboard", label: "儀表板", icon: LayoutDashboard },
  { href: "/cycles", label: "週期", icon: RefreshCcw },
  { href: "/goals", label: "目標", icon: Target },
  { href: "/tasks/week", label: "任務", icon: ListCheck },
  { href: "/history", label: "歷史", icon: History },
];

interface NotificationItem {
  id: string;
  type: "today" | "expired";
  message: string;
  href: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, displayName, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notified, setNotified] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 登入後檢查通知，只觸發一次
  useEffect(() => {
    if (!user || notified) return;

    const checkNotifications = async () => {
      const supabase = createClient();
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const items: NotificationItem[] = [];

      // 查今日待執行任務數
      const { count: todayCount } = await supabase
        .from("task_instances")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("scheduled_date", todayStr)
        .eq("status", "scheduled");

      if ((todayCount ?? 0) > 0) {
        items.push({
          id: "today",
          type: "today",
          message: `你今天有 ${todayCount} 個待執行任務`,
          href: "/tasks/today",
        });
      }

      // 查過期未完成任務數
      const { count: expiredCount } = await supabase
        .from("task_instances")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lt("scheduled_date", todayStr)
        .eq("status", "scheduled");

      if ((expiredCount ?? 0) > 0) {
        items.push({
          id: "expired",
          type: "expired",
          message: `有 ${expiredCount} 個任務已過期未完成`,
          href: "/tasks/board",
        });
      }

      setNotifications(items);
      setNotified(true);

      // 等頁面渲染完再通知
      setTimeout(() => {
        items.forEach(item => {
          if (item.type === "today") {
            toast(item.message, { description: "前往今日視圖查看", duration: 5000 });
          } else {
            toast.warning(item.message, { description: "前往看板視圖處理", duration: 6000 });
          }
        });
      }, 1000);
    };

    checkNotifications();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    toast.success("已登出");
  };

  const isActive = (href: string) => {
    if (href === "/tasks/week") return pathname.startsWith("/tasks");
    return pathname === href;
  };

  const unreadCount = notifications.length;

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
            onClick={() => {
              if (isMobile) setCollapsed(true);
            }}
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
        {/* 通知按鈕 */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-500",
                "transition-colors hover:bg-zinc-100 hover:text-zinc-700 rounded-md cursor-pointer",
                collapsed && "justify-center px-0",
              )}
            >
              <Bell size={15} className="shrink-0" />
              {!collapsed && <span>通知</span>}

              {/* 未讀徽章 */}
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full bg-rose-500 text-white font-bold leading-none",
                    collapsed
                      ? "absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[8px]"
                      : "ml-auto w-4 h-4 text-[9px]",
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent side="right" align="end" className="w-72 p-0 shadow-lg">
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <span className="text-sm font-semibold text-zinc-700">通知</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setNotifications([])}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                >
                  全部清除
                </button>
              )}
            </div>

            {/* 通知列表 */}
            <div className="py-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-zinc-400">沒有待處理通知</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => {
                      router.push(notif.href);
                      setNotifications(prev => prev.filter(n => n.id !== notif.id));
                      setPopoverOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left cursor-pointer"
                  >
                    <span className="text-base shrink-0 mt-0.5">
                      {notif.type === "today" ? <List size={15} /> : <TriangleAlert size={15} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-700">{notif.message}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {notif.type === "today" ? "前往今日視圖" : "前往看板視圖"}
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Link
          href="/profile"
          onClick={() => {
            if (isMobile) setCollapsed(true);
          }}
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
