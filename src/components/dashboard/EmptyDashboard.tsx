import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function EmptyDashboard() {
  return (
    <>
      <div className="flex flex-col gap-2.5 items-center justify-center p-10">
        <h1 className="text-2xl font-bold">歡迎使用 BitByBit</h1>
        <h3 className="text-base sm:text-lg text-center text-zinc-500">
          用 12 週的時間，達成多數人 12 個月才能做到的成就。
        </h3>
      </div>
      <Card className="flex flex-col gap-5 items-center justify-center w-60 sm:w-1/3 p-5 sm:p-10 mx-auto border rounded-xl bg-white text-center">
        <div className="flex flex-col gap-1 items-center justify-center">
          <h4 className="text-base font-semibold">開始計畫</h4>
          <p className="text-sm">開啟你的 12 週計畫之旅</p>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center">
          <h4 className="text-base font-semibold">第一步：明確願景</h4>
          <p className="text-sm">制定你的願景與週期，讓目標真正被執行</p>
        </div>
        <Button variant="default">
          <Link href="/cycles">建立第一個週期</Link>
        </Button>
      </Card>
    </>
  );
}
