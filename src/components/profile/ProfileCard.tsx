"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/src/store/uiStore";
import { createClient } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import { Link } from "lucide-react";

export function ProfileCard() {
  const { user } = useAuth();
  const { profileName, setProfileName } = useUIStore();

  const [inputName, setInputName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileName) setInputName(profileName);
  }, [profileName]);

  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const fallbackText = (profileName || inputName).slice(0, 2).toUpperCase() || "U"; // 名字縮寫
  const isGoogleUser = !!user?.app_metadata?.providers?.includes("google");

  const handleSave = async () => {
    if (!inputName.trim()) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: user!.id,
        display_name: inputName.trim(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      setProfileName(inputName.trim());
      toast.success("顯示名稱已更新");
    } catch (error) {
      console.error("updateUser ERROR:", error);
      toast.error("更新失敗，請再試一次");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-14 h-14">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={inputName} />}
          <AvatarFallback className="bg-zinc-100 text-zinc-600 text-base font-medium">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium text-zinc-800">
            {profileName || inputName || "未設定名稱"}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">{user?.email}</div>
          {isGoogleUser && (
            <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <Link size={13} />
              已連結 Google 帳號
            </div>
          )}
        </div>
      </div>

      <div className="text-sm font-semibold text-zinc-800 mb-4">個人資料</div>

      <div className="space-y-4">
        {/* 顯示名稱 */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-xs text-zinc-600">
            顯示名稱
          </Label>
          <Input
            id="displayName"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            placeholder="輸入你的顯示名稱"
            disabled={isSaving}
          />
        </div>

        {/* 電子郵件 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-600">
            電子郵件<span className="ml-1.5 text-[10px] text-zinc-400 font-normal">(無法更改)</span>
          </Label>
          <Input
            value={user?.email ?? ""}
            disabled
            className="bg-zinc-100 text-zinc-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <Button size="sm" onClick={handleSave} disabled={isSaving || !inputName.trim()}>
          {isSaving ? "儲存中..." : "儲存變更"}
        </Button>
      </div>
    </div>
  );
}
