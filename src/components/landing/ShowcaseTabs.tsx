import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { LockKeyhole } from "lucide-react";

export function ShowcaseTabs() {
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
