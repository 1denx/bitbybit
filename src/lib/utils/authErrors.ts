export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "發生錯誤，請稍後再試";

  const message = error.message;

  if (message.includes("User already registered")) return "此 Email 已被註冊";
  if (message.includes("Password should be at least")) return "密碼至少需要 6 個字元";
  if (message.includes("Unable to validate email address")) return "Email 格式不正確";
  if (message.includes("Invalid login credentials")) return "Email 或密碼錯誤";
  if (message.includes("Email not confirmed")) return "請先確認電子郵件後再登入";

  return message || "發生錯誤，請再試一次";
}
