import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCv } from "@/lib/cv/schema";
import { cvToDocx } from "@/lib/cv/docx";
import { safeFileName } from "@/lib/cv/html";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Chưa đăng nhập", { status: 401 });
  const { data: resume } = await supabase.from("resumes").select("data").eq("id", id).single();
  if (!resume) return new NextResponse("Không tìm thấy CV", { status: 404 });
  const cv = normalizeCv(resume.data);
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
