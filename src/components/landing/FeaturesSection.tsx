import {
  RefreshCcw,
  Target,
  CalendarRange,
  Columns3,
  ChartColumnIncreasing,
  History,
} from "lucide-react";

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

export function FeaturesSection() {
  return (
    <div className="max-w-300 mx-auto px-10">
      <div
        className="flex flex-col items-center py-24 border-t border-zinc-100 reveal"
        id="features"
      >
        <div className="text-sm font-medium tracking-widest text-zinc-400 uppercase mb-3">
          核心功能
        </div>
        <h2 className="serif text-center text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.02em] leading-[1.2] mb-3">
          用系統讓目標不再只是計畫
        </h2>
        <p className="text-center text-base lg:text-lg text-zinc-500 leading-[1.7] mb-12 max-w-120">
          六個模組環環相扣，從設定到回顧形成完整循環。
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureItems.map(({ icon: Icon, title, desc }) => (
            <div
              className="reveal border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors"
              key={title}
            >
              <div className="mb-3">
                <Icon size={24} />
              </div>
              <div className="text-lg font-medium mb-1.5">{title}</div>
              <div className="text-sm text-zinc-500 leading-[1.6]">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
