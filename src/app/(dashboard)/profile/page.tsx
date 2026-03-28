import { ProfileCard } from "@/src/components/profile/ProfileCard";
import { PasswordCard } from "@/src/components/profile/PasswordCard";

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">會員設定</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full grid sm:grid-cols-2 gap-4">
          <ProfileCard />
          <PasswordCard />
        </div>
      </div>
    </div>
  );
}
