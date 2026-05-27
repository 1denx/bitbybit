import { describe, it, expect } from "vitest";
import { getAuthErrorMessage } from "../authErrors";

describe("getAuthErrorMessage", () => {
  it("非 Error 物件 → 通用錯誤訊息", () => {
    expect(getAuthErrorMessage("some string")).toBe("發生錯誤，請稍後再試");
    expect(getAuthErrorMessage(null)).toBe("發生錯誤，請稍後再試");
    expect(getAuthErrorMessage(42)).toBe("發生錯誤，請稍後再試");
  });

  it('"User already registered" → 此 Email 已被註冊', () => {
    expect(getAuthErrorMessage(new Error("User already registered"))).toBe("此 Email 已被註冊");
  });

  it('"Password should be at least" → 密碼至少需要 6 個字元', () => {
    expect(getAuthErrorMessage(new Error("Password should be at least 6 characters"))).toBe(
      "密碼至少需要 6 個字元",
    );
  });

  it('"Unable to validate email address" → Email 格式不正確', () => {
    expect(getAuthErrorMessage(new Error("Unable to validate email address: invalid format"))).toBe(
      "Email 格式不正確",
    );
  });

  it('"Invalid login credentials" → Email 或密碼錯誤', () => {
    expect(getAuthErrorMessage(new Error("Invalid login credentials"))).toBe("Email 或密碼錯誤");
  });

  it('"Email not confirmed" → 請先確認電子郵件後再登入', () => {
    expect(getAuthErrorMessage(new Error("Email not confirmed"))).toBe("請先確認電子郵件後再登入");
  });

  it("未知的 Supabase 錯誤 → 直接顯示原始訊息", () => {
    expect(getAuthErrorMessage(new Error("some unknown supabase error"))).toBe(
      "some unknown supabase error",
    );
  });
});
