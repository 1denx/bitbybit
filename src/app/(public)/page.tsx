"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Check, ChevronDown } from "lucide-react";
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
        <div className="py-24 grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="fade-up delay-1 text-xs font-medium tracking-widest text-zinc-400 uppercase mb-5">
              12 週目標追蹤系統
            </div>
            <h1 className="fade-up delay-2 serif text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              不是設目標
              <br />
              而是真正執行它
            </h1>
            <p className="fade-up delay-3 text-base leading-[1.75] text-zinc-500 mb-9">
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
    </div>
  );
}
