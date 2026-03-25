import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function CtaSection() {
  return (
    <div className="reveal text-zinc-900 py-24 px-10 text-center my-20">
      <h2 className="serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.02em] mb-3">
        準備好開始你的計畫了嗎？
      </h2>
      <p className="text-base lg:text-lg text-zinc-400 mb-8">
        設定你的第一個 12 週目標，今天就開始。
      </p>
      <Button asChild className="text-base font-medium px-8 py-6">
        <Link href="/auth">立即體驗，免費開始</Link>
      </Button>
    </div>
  );
}
