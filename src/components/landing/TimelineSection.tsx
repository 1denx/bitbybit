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

export function TimeLineSection() {
  return (
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
  );
}
