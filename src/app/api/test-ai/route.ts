import { NextResponse } from "next/server";
import { loadPrompt, toPlainTable } from "@/lib/prompts";
import { ask, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

// Dữ liệu giả để thử — đúng 3 dòng như bảng phần 2 của sheet.
const SAMPLE = [
  { "Đầu mục": "1. Bạn là ai", "Bạn điền": "Sinh viên Kinh tế mới tốt nghiệp, định hướng Data Analyst" },
  { "Đầu mục": "2. Bạn mạnh gì", "Bạn điền": "SQL, Power BI, Excel; có project phân tích dữ liệu bán hàng" },
  { "Đầu mục": "3. Bạn muốn gì", "Bạn điền": "Muốn dùng dữ liệu hỗ trợ quyết định kinh doanh trong ngành bán lẻ" },
];

export async function GET() {
  const started = Date.now();
  try {
    const prompt = await loadPrompt("about", toPlainTable(SAMPLE));
    const text = await ask(prompt);
    const body = [
      `OK — model ${MODEL}, ${Date.now() - started} ms`,
      "",
      "=== DỮ LIỆU ĐƯA VÀO ===",
      toPlainTable(SAMPLE),
      "",
      "=== CLAUDE TRẢ VỀ ===",
      text,
    ].join("\n");
    return new NextResponse(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`LỖI: ${msg}`, { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}
