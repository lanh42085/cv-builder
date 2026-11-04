import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCv } from "@/lib/cv/schema";
import { applyTailored, type Tailored } from "@/lib/cv/tailor";
import { cvToDocx } from "@/lib/cv/docx";
import { safeFileName } from "@/lib/cv/html";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const job = url.searchParams.get("job");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Chưa đăng nhập", { status: 401 });
  const { data: resume } = await supabase.from("resumes").select("data").eq("id", id).single();
  if (!resume) return new NextResponse("Không tìm thấy CV", { status: 404 });
  let cv = normalizeCv(resume.data);
  if (job) {
    const { data: jv } = await supabase.from("job_versions").select("tailored").eq("id", job).single();
    if (jv?.tailored) cv = applyTailored(cv, jv.tailored as Tailored);
  }
  try {
    const buf = await cvToDocx(cv);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": `attachment; filename="${safeFileName(cv, "docx")}"`,
      },
    });
  } catch (err) {
    return new NextResponse(`Lỗi xuất DOCX: ${err instanceof Error ? err.message : String(err)}`, { status: 500 });
  }
}
