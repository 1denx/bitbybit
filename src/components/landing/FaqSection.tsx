import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";

const faqItems = [
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

export function FaqSection() {
  return (
    <div className="mx-auto px-10 bg-black">
      <div className="max-w-200 flex flex-col items-center py-24 reveal mx-auto">
        <div className="text-xs font-medium tracking-widest text-zinc-400 uppercase mb-3">
          常見問題
        </div>
        <h2 className="serif text-4xl font-bold text-white tracking-[-0.02em] leading-[1.2] mb-10">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map(({ q, a }, i) => (
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
  );
}
