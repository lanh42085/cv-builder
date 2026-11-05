import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // Thu quyền: email bị xóa khỏi danh sách thì lần vào sau bị đăng xuất
  if (user && (path.startsWith("/app") || path.startsWith("/admin"))) {
    const email = (user.email ?? "").toLowerCase();
    if (email !== "lananh.laxi@gmail.com") {
      const { data: ok } = await supabase.from("allowed_emails").select("email").eq("email", email).maybeSingle();
      if (!ok) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login"; url.search = "?error=denied";
        return NextResponse.redirect(url);
      }
    }
    if (path.startsWith("/admin") && email !== "lananh.laxi@gmail.com") {
      const url = request.nextUrl.clone(); url.pathname = "/"; url.search = "";
      return NextResponse.redirect(url);
    }
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login"],
};
