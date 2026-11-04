import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadPrompt } from "@/lib/prompts";
import { ask } from "@/lib/anthropic";
import { normalizeCv } from "@/lib/cv/schema";
import { aboutTable, experienceTable, projectsTable, parseExperience, parseOptions, parseProjects } from "@/lib/cv/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

const SECTIONS = ["about", "experience", "projects"] as const;
type Section = (typeof SECTIONS)[number];

export async function POST(req: Request, ctx: { params: Promise<{ section: string }> }) {
  const { section } = await ctx.params;
  if (!SECTIONS.includes(section as Section)) return NextResponse.json({ error: "Section không hợp lệ" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  let body: { cv?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }); }
  const cv = normalizeCv(body.cv);

  try {
    if (section === "about") {
      if (!cv.raw.aboutMe.whoAmI && !cv.raw.aboutMe.strengths) return NextResponse.json({ error: "Hãy điền ít nhất mục 1 và 2 trước." }, { status: 400 });
      const text = await ask(await loadPrompt("about", aboutTable(cv)), 2000);
      const options = parseOptions(text);
      if (options.length === 0) return NextResponse.json({ error: "AI trả về không đúng định dạng, thử lại.", raw: text }, { status: 502 });
      return NextResponse.json({ options, raw: text });
    }
    if (section === "experience") {
      if (cv.raw.experience.length === 0) return NextResponse.json({ error: "Chưa có kinh nghiệm nào để viết." }, { status: 400 });
      const text = await ask(await loadPrompt("experience", experienceTable(cv)), 8000);
      const { sections, notes } = parseExperience(text, cv);
      if (sections.length === 0) return NextResponse.json({ error: "AI trả về không đúng định dạng, thử lại.", raw: text }, { status: 502 });
      return NextResponse.json({ sections, notes, raw: text });
    }
    if (cv.raw.projects.length === 0) return NextResponse.json({ error: "Chưa có project nào để viết." }, { status: 400 });
    const text = await ask(await loadPrompt("projects", projectsTable(cv)), 6000);
    const { sections, notes } = parseProjects(text, cv);
    if (sections.length === 0) return NextResponse.json({ error: "AI trả về không đúng định dạng, thử lại.", raw: text }, { status: 502 });
    return NextResponse.json({ sections, notes, raw: text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
