"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/ui/auth/LoginForm";
import { RegisterForm } from "@/src/components/ui/auth/RegisterForm";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const { isLoading, isAuthenticated, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registered, setRegistered] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="mx-auto w-8 h-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    // middleware 會自動導向
    toast.success("登入成功");
  };

  const handleRegisterSuccess = () => {
    setRegistered(true);
    toast.success("註冊成功，請確認電子郵件後登入");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">BitByBit</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900">BitByBit</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === "login" ? "登入後繼續你的目標追蹤" : "建立帳號，開啟你的第一個 12 週週期"}
            </p>
          </div>

          {/* 註冊成功提示 */}
          {registered ? (
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm space-y-4">
              <p className="text-lg font-semibold">確認電子郵件</p>
              <p className="text-sm text-muted-foreground">
                已寄送確認信至你的信箱，請點擊信中連結後再登入
              </p>
              <button
                type="button"
                className="text-sm text-muted-foreground underline cursor-pointer"
                onClick={() => {
                  setRegistered(false);
                  setMode("login");
                }}
              >
                返回登入
              </button>
            </div>
          ) : mode === "login" ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setMode("register")}
              onLogin={login}
              onGoogleLogin={loginWithGoogle}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setMode("login")}
              onRegister={register}
            />
          )}
        </div>
      </main>
    </div>
  );
}
