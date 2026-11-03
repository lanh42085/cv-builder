import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;

const HTML = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; font-family: "Be Vietnam Pro", Arial, sans-serif; font-size: 11pt; color: #111; }
  .page { width: 210mm; min-height: 297mm; padding: 18mm 16mm; box-sizing: border-box; }
  h1 { font-size: 22pt; margin: 0; color: #1F4E79; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #1F4E79; margin: 14pt 0 6pt; }
  .meta { color: #555; font-size: 10pt; }
  ul { margin: 4pt 0; padding-left: 16pt; }
  .row { display: flex; justify-content: space-between; }
</style></head>
<body><div class="page">
  <h1>NGUYỄN VĂN A</h1>
  <div><strong>Data Analyst (Fresher)</strong></div>
  <div class="meta">(+84) 9xx xxx xxx | a@gmail.com | linkedin.com/in/nguyenvana | github.com/nguyenvana</div>
  <h2>About me</h2>
  <p>Entry-level Data Analyst with a background in Economics. Skilled in analyzing sales data with SQL and building Power BI dashboards. Aiming to use data to support retail business decisions.</p>
  <h2>Work experience</h2>
  <div class="row"><strong>Công ty ABC — Intern Data Analyst</strong><span>06/2025 – 09/2025</span></div>
  <ul>
    <li>Consolidated daily sales data from 12 stores using Power Query, building a weekly report for the Sales team.</li>
    <li>Tracked promotion performance in Power BI, identifying three underperforming campaigns.</li>
  </ul>
  <h2>Projects</h2>
  <div class="row"><strong>Retail Sales Analysis | SQL, Power BI</strong><span>github.com/nguyenvana/retail</span></div>
  <ul>
    <li>Cleaned and modeled 120k order rows using SQL CTEs and window functions on BigQuery.</li>
    <li>Found that 20% of SKUs drove 65% of revenue; recommended focusing stock on top SKUs.</li>
  </ul>
  <h2>Skills</h2>
  <ul><li>Hard skills: SQL, Power BI, Excel (Pivot, Power Query), Python (pandas)</li><li>Soft skills: Analytical thinking, problem solving</li></ul>
  <h2>Education</h2>
  <div class="row"><strong>Đại học Kinh tế Quốc dân — Quản trị kinh doanh</strong><span>2021 – 2025</span></div>
  <p style="margin-top:24pt;color:#888;font-size:9pt">Bản thử nghiệm — kiểm tra font tiếng Việt có dấu và chữ copy được (text layer).</p>
</div></body></html>`;

export async function GET() {
  const started = Date.now();
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(HTML, { waitUntil: "load" });
    await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    await browser.close();
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'inline; filename="test-cv.pdf"',
        "x-render-ms": String(Date.now() - started),
      },
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    return new NextResponse(`LỖI xuất PDF: ${msg}`, { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}
