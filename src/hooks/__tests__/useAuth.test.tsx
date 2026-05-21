import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/dist/server/api-utils";

const {
  mockSignInWithPassword,
  mockSignup,
  mockSignInWithOAuth,
  mockSupabaseFrom,
  mockPush,
  mockRefresh,
  mockSignOut,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignup: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockSupabaseFrom: vi.fn(),
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock("../../lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignup,
      signInWithOAuth: mockSignInWithOAuth,
    },
    from: mockSupabaseFrom,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => ({
    user: null,
    session: null,
    isLoading: false,
    signOut: mockSignOut,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockSupabaseFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }),
    }),
  });
});

describe("useAuth - login()", () => {
  it("登入成功 -> 呼叫 signInWithPassword，導向 dashboard，回傳 success: true", async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    const { result } = renderHook(() => useAuth());

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.login("test@example.com", "pass1234");
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass1234",
    });
    expect(mockPush).toHaveBeenCalledWith("dashboard");
    expect(authResult!.success).toBe(true);
    expect(authResult!.error).toBeUndefined();
  });

  it("登入失敗 -> 不導向，回傳中文錯誤訊息 「Email 或密碼錯誤」", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: new Error("Invalid login credentials"),
    });

    const { result } = renderHook(() => useAuth());
    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.login("test@example.com", "wrongpass");
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(authResult!.success).toBe(false);
    expect(authResult!.error).toBe("Email 或密碼錯誤");
  });
});

describe("useAuth - register()", () => {
  it("註冊成功 -> 帶入 display_name、不立即導向，回傳 success: true", async () => {
    mockSignup.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth());

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.register("new@example.com", "pass1234", "Eden");
    });

    expect(mockSignup).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "pass1234",
      options: { data: { display_name: "Eden" } },
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(authResult!.success).toBe(true);
  });

  it("Email 已被使用 -> 回傳中文錯誤訊息 「Email 已被註冊」", async () => {
    mockSignup.mockResolvedValue({
      data: null,
      error: new Error("User already registered"),
    });

    const { result } = renderHook(() => useAuth());

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.register("existing@example.com", "pass1234", "Eden");
    });
    expect(authResult!.success).toBe(false);
    expect(authResult!.error).toBe("此 Email 已被註冊");
  });
});

describe("useAuth - loginWithGoogle()", () => {
  it("觸發 Google OAuth，帶入正確的 redirectTo", async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });

    const { result } = renderHook(() => useAuth());

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.loginWithGoogle();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
    expect(authResult!.success).toBe(true);
  });
});

describe("useAuth - logout()", () => {
  it("呼叫 context 的 signOut，並導向首頁 '/'", async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
