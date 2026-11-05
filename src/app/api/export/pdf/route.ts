import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { createClient } from "@/lib/supabase/server";
import { normalizeCv } from "@/lib/cv/schema";
import { applyTailored, type Tailored } from "@/lib/cv/tailor";
import { cvToHtml, safeFileName } from "@/lib/cv/html";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args, defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(), headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(await cvToHtml(cv), { waitUntil: "load" });
    await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready);
    const pdf = await page.pdf({ format: cv.style.layout.format === "Letter" ? "letter" : "a4", printBackground: true, preferCSSPageSize: true });
    await browser.close();
    return new NextResponse(Buffer.from(pdf), {
      headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${safeFileName(cv, "pdf")}"` },
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return new NextResponse(`Lỗi xuất PDF: ${err instanceof Error ? err.message : String(err)}`, { status: 500 });
  }
}
