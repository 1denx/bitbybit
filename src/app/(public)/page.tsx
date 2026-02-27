import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">BitByBit</h1>
      <p className="mb-8 text-zinc-500">12 週目標執行系統</p>
      <Link
        href="/auth"
        className="rounded-lg bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-700"
      >
        開始使用
      </Link>
    </div>
  );
}
