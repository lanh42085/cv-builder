import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { ask } from "@/lib/anthropic";
import { normalizeCv } from "@/lib/cv/schema";
import { cvToPlainText, parseTailored } from "@/lib/cv/tailor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { resumeId, jobTitle, jdText, keywordOutput, jobId } = (await req.json()) as
    { resumeId?: string; jobTitle?: string; jdText?: string; keywordOutput?: string; jobId?: string };
  if (!resumeId || !jdText || !keywordOutput) return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });

  const { data: resume } = await supabase.from("resumes").select("data").eq("id", resumeId).single();
  if (!resume) return NextResponse.json({ error: "Không tìm thấy CV" }, { status: 404 });
  const cv = normalizeCv(resume.data);

  try {
    const template = await readFile(path.join(process.cwd(), "prompts", "tailor.md"), "utf8");
    const prompt = template.replace("{{KEYWORDS}}", keywordOutput.trim()).replace("{{DATA}}", cvToPlainText(cv));
    const text = await ask(prompt, 8000);
    const tailored = parseTailored(text, cv);
    if (!tailored) return NextResponse.json({ error: "AI trả về không đúng định dạng, thử lại.", raw: text }, { status: 502 });

    const { data: row, error } = jobId
      ? await supabase.from("job_versions").update({ tailored, keyword_output: keywordOutput }).eq("id", jobId).eq("user_id", user.id)
          .select("id, job_title, created_at").single()
      : await supabase.from("job_versions")
          .insert({ resume_id: resumeId, user_id: user.id, job_title: (jobTitle ?? "").trim() || "Job", jd_text: jdText, keyword_output: keywordOutput, tailored })
          .select("id, job_title, created_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: row.id, jobTitle: row.job_title, createdAt: row.created_at, tailored });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
