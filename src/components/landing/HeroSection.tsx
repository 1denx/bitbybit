import Link from "next/link";
import { Button } from "../ui/button";
import { HeroCalendar } from "./HeroCalendar";

export function HeroSection() {
  return (
    <div className="max-w-300 mx-auto px-10">
      <div className="py-30 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="fade-up delay-1 text-sm font-medium tracking-widest text-zinc-400 uppercase mb-5">
            12 週目標追蹤系統
          </div>
          <h1 className="fade-up delay-2 serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-5">
            不是設目標
            <br />
            而是真正執行它
          </h1>
          <p className="fade-up delay-3 text-lg lg:text-xl  leading-[1.75] text-zinc-500 mb-12">
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
  );
}
