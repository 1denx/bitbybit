import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 建立一個 URL 物件，方便解析 Query String
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // console.log("callback hit, code:", code);

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      // console.log("exchange result:", { data, error });

      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
      return NextResponse.redirect(`${origin}/auth?error=callback_error`);
    } catch (error) {
      // console.error("callback error:", error);
      return NextResponse.redirect(`${origin}/auth?error=sever_error`);
    }
  }
  return NextResponse.redirect(`${origin}/auth?error=no_code`);
}
