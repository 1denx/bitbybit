"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Trash2,
  Check,
  RefreshCcw,
  Target,
  CalendarRange,
  Columns3,
  ChartColumnIncreasing,
  History,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import "./landing.css";

// Hero Calendar
function HeroCalendar() {
  const SLOT_H = 28;
  const START_H = 8;
  const TOTAL_SLOTS = 12;

  const [events, setEvents] = useState([
    {
      id: "a",
      title: "讀官方文件",
      startH: 9,
      startM: 0,
      endH: 10,
      endM: 0,
      bg: "#f0f9ff",
      border: "#0ea5e9",
      done: false,
      deleted: false,
    },
    {
      id: "b",
      title: "side project 頁面",
      startH: 10,
      startM: 0,
      endH: 11,
      endM: 30,
      bg: "#fff1f3",
      border: "#f43f5e",
      done: false,
      deleted: false,
    },
    {
      id: "c",
      title: "每日運動",
      startH: 12,
      startM: 0,
      endH: 13,
      endM: 0,
      bg: "#fafafa",
      border: "#a1a1aa",
      done: false,
      deleted: false,
    },
  ]);

  const colRef = useRef<HTMLDivElement>(null);

  function minsOffset(h: number, m: number) {
    return (((h - START_H) * 60 + m) / 30) * SLOT_H;
  }
  function snapTop(raw: number) {
    return Math.round(raw / SLOT_H) * SLOT_H;
  }
  function topToTime(top: number) {
    const mins = Math.round(top / SLOT_H) * 30;
    const h = START_H + Math.floor(mins / 60);
    const m = mins % 60;
    return { h: Math.min(h, 23), m };
  }

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const startY = e.clientY;
    const startTop = el.offsetTop;
    el.classList.add("dragging");
    const onMove = (ev: MouseEvent) => {
      const raw = startTop + (ev.clientY - startY);
      el.style.top = Math.max(0, Math.min(snapTop(raw), (TOTAL_SLOTS - 1) * SLOT_H)) + "px";
    };
    const onUp = () => {
      el.classList.remove("dragging");
      const t = topToTime(el.offsetTop);
      setEvents(prev =>
        prev.map(ev => {
          if (ev.id !== id) return ev;
          const durMins = ev.endH * 60 + ev.endM - (ev.startH * 60 + ev.startM);
          const newEndMins = t.h * 60 + t.m + durMins;
          return {
            ...ev,
            startH: t.h,
            startM: t.m,
            endH: Math.floor(newEndMins / 60),
            endM: newEndMins % 60,
          };
        }),
      );
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, el: HTMLElement) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = el.offsetHeight;
    const onMove = (ev: MouseEvent) => {
      const newH = Math.max(SLOT_H, Math.round((startH + (ev.clientY - startY)) / SLOT_H) * SLOT_H);
      el.style.height = newH + "px";
    };
    const onUp = () => {
      const durMins = Math.round(el.offsetHeight / SLOT_H) * 30;
      setEvents(prev =>
        prev.map(ev => {
          if (ev.id !== id) return ev;
          const endMins = ev.startH * 60 + ev.startM + durMins;
          return { ...ev, endH: Math.floor(endMins / 60), endM: endMins % 60 };
        }),
      );
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const timeLabels = Array.from({ length: TOTAL_SLOTS }, (_, i) =>
    i % 2 === 0 ? String(START_H + Math.floor(i / 2)).padStart(2, "0") : "",
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      {/* top bar */}
      <div className="bg-zinc-50 border-b border-zinc-100 px-3.5 py-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
        <span className="ml-1.5">本週視圖</span>
      </div>

      {/* body */}
      <div className="flex mt-3" style={{ height: 320 }}>
        {/* time axis */}
        <div className="w-8.5 shrink-0 border-r border-zinc-100 -mt-2.5">
          {timeLabels.map((lbl, i) => (
            <div
              key={i}
              className="flex items-start justify-end pr-1.5 pt-0.5"
              style={{ height: 28, fontSize: 10, color: "#a1a1aa", fontFamily: "monospace" }}
            >
              {lbl}
            </div>
          ))}
        </div>

        {/* slots */}
        <div className="flex-1 relative " ref={colRef}>
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
            <div
              key={i}
              style={{
                height: 28,
                borderBottom: `1px ${i % 2 === 0 ? "solid" : "dashed"} #f4f4f5`,
              }}
            />
          ))}
          {events
            .filter(ev => !ev.deleted)
            .map(ev => {
              const top = minsOffset(ev.startH, ev.startM);
              const height = Math.max(SLOT_H, minsOffset(ev.endH, ev.endM) - top);
              const isShort = height <= SLOT_H;
              return (
                <div
                  key={ev.id}
                  className="ev"
                  style={{
                    top,
                    height,
                    background: ev.bg,
                    borderLeft: `3px solid ${ev.border}`,
                    opacity: ev.done ? 0.45 : 1,
                    filter: ev.done ? "grayscale(30%)" : "none",
                  }}
                  onMouseDown={ev.done ? undefined : e => handleDragStart(e, ev.id)}
                >
                  <div className="ev-inner">
                    <div
                      className="ev-check"
                      style={{
                        borderColor: ev.done ? "transparent" : ev.border,
                        background: ev.done ? "#1a1a1a" : "transparent",
                      }}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() =>
                        setEvents(prev =>
                          prev.map(e2 => (e2.id === ev.id ? { ...e2, done: !e2.done } : e2)),
                        )
                      }
                    >
                      {ev.done && <Check size={8} strokeWidth={2.5} color="#fff" />}
                    </div>
                    <div className="ev-body">
                      <div
                        className="ev-title"
                        style={ev.done ? { textDecoration: "line-through", opacity: 0.45 } : {}}
                      >
                        {ev.title}
                      </div>
                      {!isShort && (
                        <div className="ev-time-lbl">
                          {String(ev.startH).padStart(2, "0")}:{String(ev.startM).padStart(2, "0")}{" "}
                          – {String(ev.endH).padStart(2, "0")}:{String(ev.endM).padStart(2, "0")}
                        </div>
                      )}
                    </div>
                    <div
                      className="ev-del"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() =>
                        setEvents(prev =>
                          prev.map(e2 => (e2.id === ev.id ? { ...e2, deleted: true } : e2)),
                        )
                      }
                    >
                      <Trash2 size={10} strokeWidth={1.8} color="#a1a1aa" />
                    </div>
                  </div>

                  {/* resize handle */}
                  {!ev.done && (
                    <div
                      className="res-handle"
                      onMouseDown={e =>
                        handleResizeStart(e, ev.id, e.currentTarget.parentElement as HTMLElement)
                      }
                    >
                      <div className="res-bar" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* hint */}
      <div className="text-center text-[10px] text-zinc-400 py-1.5 border-t border-zinc-100">
        拖曳任務移動時間　hover 底部調整長度
      </div>
    </div>
  );
}

// Feature items
const featureItems = [
  {
    icon: RefreshCcw,
    title: "12 週週期",
    desc: "以 12 週為一個週期，明確的時間壓力讓目標更有執行動力。",
  },
  { icon: Target, title: "目標管理", desc: "每個週期設定核心目標，搭配可量化的執行任務。" },
  {
    icon: CalendarRange,
    title: "週曆排程",
    desc: "拖曳任務到週曆，resize 調整時間長度，視覺化掌握計畫。",
  },
  {
    icon: Columns3,
    title: "看板 & 矩陣",
    desc: "看板追蹤進行中任務，優先級矩陣幫你聚焦最重要的事。",
  },
  {
    icon: ChartColumnIncreasing,
    title: "週回顧",
    desc: "每週結束後填寫回顧，搭配達成率趨勢圖檢視執行狀況。",
  },
  {
    icon: History,
    title: "歷史紀錄",
    desc: "完成的週期保存 12 週達成率數據，讓成長軌跡一目了然。",
  },
];

// Step items
const stepItems = [
  {
    step: "Step 1",
    title: "建立週期 & 設定願景",
    desc: "以 12 週為單位，寫下這段時間最重要的願景方向，給自己一個清晰的終點。",
    side: "left",
    active: true,
  },
  {
    step: "Step 2",
    title: "拆解目標 & 新增任務",
    desc: "將大目標拆成可執行的具體任務，設定頻率與執行週次，讓目標有路徑可走。",
    side: "right",
    active: true,
  },
  {
    step: "Step 3",
    title: "拖曳排程 & 每日執行",
    desc: "把任務排進週曆，今日視圖追蹤當天進度，逐一勾選完成，讓行動落地。",
    side: "left",
    active: true,
  },
  {
    step: "Step 4",
    title: "週回顧 & 持續調整",
    desc: "每週日填寫回顧，看達成率趨勢，調整下週策略，形成持續改進的循環。",
    side: "right",
    active: false,
  },
];

// ShowCase items
const showCaseItems = [
  { label: "本週視圖", desc: "拖曳排程，resize 調整時間" },
  { label: "看板視圖", desc: "未排程 / 進行中 / 已完成" },
  { label: "優先級矩陣", desc: "拖曳調整緊急 × 重要程度" },
  { label: "週回顧", desc: "每日達成率 + 文字回顧" },
];

// Showcase Tabs
function ShowcaseTabs() {
  return (
    <Tabs defaultValue="week" className="border border-zinc-200 p-4 rounded-xl shadow-sm">
      <TabsList className="w-full bg-zinc-100 p-1 h-auto rounded-lg mb-3.5">
        <TabsTrigger
          value="week"
          className="flex-1 px-3 py-2 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
        >
          週曆
        </TabsTrigger>
        <TabsTrigger
          value="goal"
          className="flex-1 px-3 py-2 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
        >
          目標
        </TabsTrigger>
        <TabsTrigger
          value="board"
          className="flex-1 px-3 py-2 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
        >
          看板
        </TabsTrigger>
        <TabsTrigger
          value="review"
          className="flex-1 px-3 py-2 text-xs rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer"
        >
          回顧
        </TabsTrigger>
      </TabsList>

      {/* 週曆 */}
      <TabsContent
        value="week"
        className="border border-zinc-200 shadow-sm rounded-xl p-2 min-h-45 mt-0"
      >
        <div className="flex gap-1.5 mt-3" style={{ height: 140 }}>
          <div className="w-7 shrink-0">
            {["09", "10", "11"].map(h => (
              <div
                key={h}
                style={{
                  height: 50,
                  fontSize: 10,
                  color: "#a1a1aa",
                  paddingTop: 15,
                  textAlign: "right",
                  paddingRight: 4,
                  fontFamily: "monospace",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          <div className="flex-1 relative border-l border-zinc-200">
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 40, borderBottom: "1px solid #f4f4f4" }} />
            ))}
            <div
              className="absolute flex gap-2"
              style={{
                top: 20,
                left: 4,
                right: 4,
                height: 52,
                background: "#f0f9ff",
                borderRadius: 8,
                borderLeft: "2px solid #0ea5e9",
                padding: "4px 6px",
              }}
            >
              <div className="w-3 h-3 mt-0.5 border border-sky-700 rounded-full" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>讀官方文件</div>
                <div style={{ fontSize: 10, color: "#a1a1aa" }}>09:00-10:00</div>
              </div>
            </div>
            <div
              className="absolute flex gap-2"
              style={{
                top: 73,
                left: 4,
                right: 4,
                height: 53,
                background: "#fff1f3",
                borderRadius: 8,
                borderLeft: "2px solid #f43f5e",
                padding: "4px 6px",
              }}
            >
              <div className="w-3 h-3 mt-0.5 border border-rose-700 rounded-full" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>side project 頁面</div>
                <div style={{ fontSize: 10, color: "#a1a1aa" }}>10:00-11:00</div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 目標 */}
      <TabsContent value="goal" className="min-h-45 mt-0">
        <div className="border border-zinc-200 shadow-sm rounded-xl p-3">
          <div className="flex justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-full">
                主要目標
              </span>
              <div className="text-sm font-medium">成為全端工程師</div>
            </div>
            <div className="flex gap-1">
              <span className="text-[10px] bg-zinc-900 text-white border border-zinc-200 px-2 py-1 rounded-full ">
                核心 2
              </span>
              <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-full text-zinc-500">
                額外 1
              </span>
            </div>
          </div>
          {[
            {
              color: "#0ea5e9",
              name: "每日讀官方文件",
              category: "核心",
              freq: "1次/週",
              weekNum: "W1-W12",
            },
            {
              color: "#f43f5e",
              name: "side project 頁面",
              category: "核心",
              freq: "每天",
              weekNum: "W1-W12",
            },
            {
              color: "#a1a1aa",
              name: "讀技術文章",
              category: "額外",
              freq: "2次/週",
              weekNum: "W1-W12",
            },
          ].map(t => (
            <div
              key={t.name}
              className="flex items-center justify-between gap-2 text-xs text-zinc-500 mb-1.5 border border-zinc-100 p-2 rounded-sm"
              style={{ borderLeftColor: t.color, borderWidth: "2px" }}
            >
              <div>{t.name}</div>
              <div className="flex gap-1">
                <span className="text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">
                  {t.category}
                </span>
                <span className="text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">
                  {t.freq}
                </span>
                <span className="text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">
                  {t.weekNum}
                </span>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* 看板 */}
      <TabsContent value="board" className="mt-0">
        <div>
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-zinc-200 shadow-sm rounded-xl p-3">
              <div className="flex justify-between mb-2">
                <div className="text-xs font-medium mb-1.5 text-zinc-900">未排程</div>
                <span className="flex items-center text-zinc-500 text-[9px] font-medium bg-zinc-100 px-2 rounded-md">
                  2
                </span>
              </div>
              {[
                { color: "#0ea5e9", name: "每日讀官方文件" },
                { color: "#a1a1aa", name: "讀技術文章" },
              ].map(t => (
                <div
                  key={t.name}
                  className="border border-zinc-100 rounded-md px-2 py-1.5 text-xs mb-1"
                  style={{ borderLeftColor: t.color, borderWidth: "2px" }}
                >
                  {t.name}
                </div>
              ))}
            </div>
            <div className="border border-zinc-200 shadow-sm rounded-xl p-3">
              <div className="flex justify-between mb-2">
                <div className="text-xs font-medium mb-1.5 text-zinc-900">進行中</div>
                <span className="flex items-center text-sky-600 text-[9px] font-medium bg-sky-100 px-2 rounded-md">
                  1
                </span>
              </div>
              <div
                className="border border-zinc-100 rounded-md px-2 py-1.5 text-xs"
                style={{ borderLeft: "2px solid #f43f5e" }}
              >
                side project 頁面
              </div>
            </div>
            <div className="border border-zinc-200 shadow-sm rounded-xl p-3">
              <div className="flex justify-between mb-2">
                <div className="text-xs font-medium mb-1.5 text-zinc-900">已完成</div>
                <span className="flex items-center text-emerald-600 text-[9px] font-medium bg-emerald-100 px-2 rounded-md">
                  0
                </span>
              </div>
              <div className="text-center text-xs text-zinc-400 mt-4">本週尚未完成任何任務</div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* 回顧 */}
      <TabsContent value="review" className="min-h-45 mt-0">
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { label: "項目總數", val: "9", color: "text-zinc-900" },
            { label: "完成總數", val: "7", color: "text-emerald-500" },
            { label: "未完成總數", val: "2", color: "text-rose-400" },
            { label: "本週達成率", val: "78%", color: "text-zinc-900" },
          ].map(item => (
            <div
              key={item.label}
              className="border border-zinc-200 shadow-sm rounded-lg p-2 text-center"
            >
              <div className="text-[10px] text-zinc-500">{item.label}</div>
              <div className={`text-lg font-bold ${item.color}`}>{item.val}</div>
            </div>
          ))}
        </div>
        <div className="border border-zinc-200 shadow-sm rounded-lg p-2.5 text-xs text-zinc-500">
          <p>本週回顧</p>
          <p className="flex items-center gap-2 mt-2 text-sm font-bold text-zinc-900 bg-zinc-100 p-3 rounded-lg">
            <LockKeyhole />
            本週回顧於週日開放填寫
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Accordion items
const AccordionItems = [
  {
    q: "可以免費使用嗎？",
    a: "目前 BitByBit 完全免費開放使用，無需信用卡。未來若推出進階功能，現有功能將持續保留免費版本。",
  },
  {
    q: "可以設定幾個目標？",
    a: "每個週期最多可設定 3 個核心目標。我們刻意限制數量，是為了幫助你聚焦在真正重要的事，而不是把每件事都列成目標。",
  },
  {
    q: "除了目標設定，還有哪些功能？",
    a: "除了目標與任務管理，BitByBit 還提供週曆拖曳排程、看板視圖、優先級矩陣（緊急 × 重要）、每週回顧、歷史週期達成率記錄，以及儀表板統計。",
  },
  {
    q: "如果這週沒完成目標怎麼辦？",
    a: "沒關係。每週回顧的目的不是評分，而是幫你看清楚發生了什麼，並在下週做出調整。未完成的任務會反映在達成率趨勢中，幫助你找到問題所在。",
  },
  {
    q: "資料會被刪除嗎？",
    a: "完成的週期資料會永久保存在你的帳號中，可以隨時到歷史頁面查看過去每個週期的執行紀錄與達成率。你的資料屬於你，我們不會主動刪除。",
  },
];

// Scroll Reveal
function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.1 },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 h-14 flex items-center justify-between px-10">
        <div className="text-base font-medium tracking-tight">BitByBit</div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="px-4">
            <Link href="/auth">登入</Link>
          </Button>
          <Button asChild variant="default" size="sm" className="px-4">
            <Link href="/auth">開始使用</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-300 mx-auto px-10">
        <div className="py-30 grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="fade-up delay-1 text-xs font-medium tracking-widest text-zinc-400 uppercase mb-5">
              12 週目標追蹤系統
            </div>
            <h1 className="fade-up delay-2 serif text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              不是設目標
              <br />
              而是真正執行它
            </h1>
            <p className="fade-up delay-3 text-base leading-[1.75] text-zinc-500 mb-12">
              參考《12週做完一年工作》的方法論，將年度計畫壓縮為 12
              週，連結目標與每日執行，讓你的計畫不再只是計畫。
            </p>
            <div className="fade-up delay-4 flex gap-3">
              <Button asChild className="px-8 py-6 text-base">
                <Link href="/auth">開始使用</Link>
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6"
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                了解更多
              </Button>
            </div>
          </div>
          <div className="fade-up delay-3">
            <HeroCalendar />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-300 mx-auto px-10">
        <div
          className="flex flex-col items-center py-24 border-t border-zinc-100 reveal"
          id="features"
        >
          <div className="text-xs font-medium tracking-widest text-zinc-400 uppercase mb-3">
            核心功能
          </div>
          <h2 className="serif text-4xl font-bold tracking-[-0.02em] leading-[1.2] mb-3">
            用系統讓目標不再只是計畫
          </h2>
          <p className="text-base text-zinc-500 leading-[1.7] mb-12 max-w-120">
            六個模組環環相扣，從設定到回顧形成完整循環。
          </p>
          <div className="grid grid-cols-3 gap-4">
            {featureItems.map(({ icon: Icon, title, desc }) => (
              <div
                className="reveal border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors"
                key={title}
              >
                <div className="mb-3">
                  <Icon size={20} />
                </div>
                <div className="text-sm font-medium mb-1.5">{title}</div>
                <div className="text-xs text-zinc-500 leading-[1.6]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TimeLine */}
      <div className="mx-auto px-10 bg-black">
        <div className="flex flex-col items-center py-24 border-zinc-100 reveal">
          <div className="text-xs font-medium tracking-widest text-white/40 uppercase mb-3">
            步驟引導
          </div>
          <h2 className="serif text-white text-4xl font-bold tracking-[-0.02em] leading-[1.2] mb-3">
            從計畫到執行
          </h2>
          <p className="text-base text-white/50 leading-[1.7] mb-12 max-w-120">
            每完成一個任務，都是在推進目標的達成。
          </p>
          <div className="tl-wrap">
            <div className="tl-center-line" />
            {stepItems.map(({ step, title, desc, side, active }) => (
              <div className="tl-row reveal" key={step}>
                {side === "left" ? (
                  <>
                    <div className="border border-white/10 bg-white/5 rounded-xl p-5 hover:border-white/20 hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-400 tracking-[0.08em] uppercase mb-1">
                        {step}
                      </div>
                      <div className="text-sm text-zinc-300 font-medium mb-1">{title}</div>
                      <div className="text-xs text-zinc-400 leading-[1.55]">{desc}</div>
                    </div>
                    <div className="tl-dot-col">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${active ? "bg-zinc-500 border-zinc-500" : "bg-white border-zinc-300"}`}
                      />
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div className="tl-dot-col">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${active ? "bg-zinc-500 border-zinc-500" : "bg-white border-zinc-300"}`}
                      />
                    </div>
                    <div className="border border-white/10 bg-white/5 rounded-xl p-5 hover:border-white/20 hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-400 tracking-[0.08em] uppercase mb-1">
                        {step}
                      </div>
                      <div className="text-sm text-zinc-300 font-medium mb-1">{title}</div>
                      <div className="text-xs text-zinc-400 leading-[1.55]">{desc}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ShowCase */}
      <div className="max-w-300 mx-auto px-10">
        <div className="flex flex-col items-center py-24 border-zinc-100 reveal">
          <div className="text-xs font-medium tracking-widest text-zinc-400 uppercase mb-3">
            產品一覽
          </div>
          <h2 className="serif text-4xl font-bold tracking-[-0.02em] leading-[1.2] mb-3">
            每個視圖各司其職
          </h2>
          <p className="text-base text-zinc-500 leading-[1.7] mb-12 max-w-120">
            從宏觀到細節，切換視圖就能看到你需要的資訊。
          </p>
          <div className="grid gap-12" style={{ gridTemplateColumns: "1fr 1.6fr" }}>
            <div>
              <div className="text-base font-medium mb-2">完整的任務管理體驗</div>
              <p className="text-sm text-zinc-500 leading-[1.7]">
                不只是代辦清單。週曆、看板、矩陣、回顧四個視角讓你從不同維度掌握進度。
              </p>
              <div className="flex flex-col gap-2.5 mt-5">
                {showCaseItems.map(({ label, desc }) => (
                  <div key={label} className="flex gap-2.5 items-start text-sm text-zinc-500">
                    <div className="w-1 h-1 rounded-full bg-zinc-400 mt-1.75 shrink-0" />
                    <div>
                      <span className="font-medium text-zinc-800">{label}</span>　{desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ShowcaseTabs />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto px-10 bg-black">
        <div className="max-w-200 flex flex-col items-center py-24 reveal mx-auto">
          <div className="text-xs font-medium tracking-widest text-zinc-400 uppercase mb-3">
            常見問題
          </div>
          <h2 className="serif text-4xl font-bold text-white tracking-[-0.02em] leading-[1.2] mb-10">
            FAQ
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {AccordionItems.map(({ q, a }, i) => (
              <AccordionItem key={q} value={`faq-${i}`}>
                <AccordionTrigger className="text-lg font-medium text-white hover:no-underline py-4.5">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-white/60 leading-[1.7] pb-4">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* CTA */}
      <div className="reveal text-zinc-900 py-24 px-10 text-center my-20">
        <h2 className="serif text-5xl font-bold tracking-[-0.02em] mb-3">
          準備好開始你的計畫了嗎？
        </h2>
        <p className="text-base text-zinc-400 mb-8">設定你的第一個 12 週目標，今天就開始。</p>
        <Button asChild className="text-base font-medium px-8 py-6">
          <Link href="/auth">立即體驗，免費開始</Link>
        </Button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center bg-black">
        <p className="text-sm text-white/40 py-10">
          COPYRIGHT © 2026 BitByBit All rights reserved.
        </p>
      </div>

      <ScrollReveal />
    </div>
  );
}
