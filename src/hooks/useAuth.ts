import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useAuthContext } from "../context/AuthContext";
import { getAuthErrorMessage } from "../lib/utils/authErrors";

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const { user, session, isLoading, signOut } = useAuthContext();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsAuthLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      router.push("dashboard");
      router.refresh();
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthResult> => {
    setIsAuthLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthResult> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const logout = async () => {
    await signOut();
    router.push("/");
  };

  return {
    user,
    session,
    isLoading,
    isAuthLoading,
    isAuthenticated: !!user,
    displayName: user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "使用者",
    login,
    register,
    loginWithGoogle,
    logout,
  };
}
