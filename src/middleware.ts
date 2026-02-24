import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          });
        },
      },
    },
  );

  // 刷新使用者 session，它能確保即使 token 過期，也能在下一次請求時自動刷新
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 未登入且不在公開頁面，則將其重新導向至登入頁
  const publicPaths = ["/", "auth"];
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith("/auth"));

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 已登入但在登入頁，則將其導向 dashboard
  if (user && pathname === "login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
