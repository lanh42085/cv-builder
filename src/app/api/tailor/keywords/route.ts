import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadPrompt } from "@/lib/prompts";
import { ask } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { jdText } = (await req.json()) as { jdText?: string };
  if (!jdText || jdText.trim().length < 50) return NextResponse.json({ error: "Dán đầy đủ JD (ít nhất vài dòng)." }, { status: 400 });
  try {
    const text = await ask(await loadPrompt("keywords", jdText.trim()), 4000);
    return NextResponse.json({ keywordOutput: text.trim() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
