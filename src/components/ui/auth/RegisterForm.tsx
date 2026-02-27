"use client";

import { useState } from "react";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Card, CardContent } from "../card";

type AuthResult = {
  success: boolean;
  error?: string;
};

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onRegister: (email: string, password: string, displayName: string) => Promise<AuthResult>;
}

export function RegisterForm({ onSuccess, onSwitchToLogin, onRegister }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onRegister(email, password, displayName);
      if (result.success) {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDisplayName("");
        onSuccess();
      } else {
        setError(result.error ?? "註冊失敗");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Tab 切換 */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <Button type="button" variant="ghost" className="flex-1" onClick={onSwitchToLogin}>
            登入
          </Button>
          <Button type="button" variant="outline" className="flex-1">
            註冊
          </Button>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="顯示名稱"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="電子郵件"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="密碼 (至少 6 個字元)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="確認密碼"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-foreground text-background"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> 建立中...
              </>
            ) : (
              <>建立帳號</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
