import { ShowcaseTabs } from "./ShowcaseTabs";

const showCaseItems = [
  { label: "本週視圖", desc: "拖曳排程，resize 調整時間" },
  { label: "看板視圖", desc: "未排程 / 進行中 / 已完成" },
  { label: "優先級矩陣", desc: "拖曳調整緊急 × 重要程度" },
  { label: "週回顧", desc: "每日達成率 + 文字回顧" },
];

export function ShowcaseSection() {
  return (
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
  );
}
