import Link from "next/link";
import { Button } from "../ui/button";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100 h-14 flex items-center justify-between px-10">
      <div className="text-base font-semibold tracking-tight">BitByBit</div>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="px-4">
          <Link href="/auth">登入</Link>
        </Button>
        <Button asChild variant="default" size="sm" className="px-4">
          <Link href="/auth">開始使用</Link>
        </Button>
      </div>
    </nav>
  );
}
