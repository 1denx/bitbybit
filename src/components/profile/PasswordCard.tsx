"use client";

import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Link } from "lucide-react";

export function PasswordCard() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 使用 Google 登入的用戶沒有密碼，不顯示這個卡片
  const isGoogleOnly =
    user?.app_metadata?.providers?.length === 1 &&
    user?.app_metadata?.providers?.includes("google");

  if (isGoogleOnly) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-semibold text-zinc-800 mb-4">修改密碼</div>
        <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-4 flex items-center gap-3">
          <Link size={18} />
          <div>
            <div className="text-sm text-zinc-600 font-medium">使用 Google 登入</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              你的帳號透過 Google 登入，無須設定密碼
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error("新密碼與確認密碼不一致");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("密碼至少需要 6 個字元");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error("目前密碼不正確");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("密碼已更新");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("updatePassword ERROR:", error);
      toast.error("密碼更新失敗，請再試一次");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="text-sm font-semibold text-zinc-800 mb-4">修改密碼</div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword" className="text-xs text-zinc-600">
            目前密碼
          </Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="••••••"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs text-zinc-600">
            新密碼
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={isSaving}
          />
          <p className="text-[10px] text-zinc-400">至少 6 個字元</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs text-zinc-600">
            確認新密碼
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={isSaving}
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[10px] text-rose-400">密碼不一致</p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <Button
          size="sm"
          onClick={handleUpdatePassword}
          disabled={
            isSaving ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
        >
          {isSaving ? "更新中..." : "更新密碼"}
        </Button>
      </div>
    </div>
  );
}
