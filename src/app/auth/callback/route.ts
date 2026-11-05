import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const email = (user?.email ?? "").toLowerCase();
      // Chỉ email trong danh sách cho phép (hoặc admin) mới được vào
      const { data: ok } = await supabase.from("allowed_emails").select("email").eq("email", email).maybeSingle();
      if (!ok && !isAdminEmail(email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=denied`);
      }
      return NextResponse.redirect(`${origin}/app`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
