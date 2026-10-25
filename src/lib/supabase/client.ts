import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/src/types";

export function createClient() {
  return createBrowserClient<Database>(
    // 建立一個專門給瀏覽器環境 (Client Components) 使用的 Supabase Client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
