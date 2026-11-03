import { readFile } from "node:fs/promises";
import path from "node:path";

/** Đọc prompt từ thư mục prompts/ và ghép dữ liệu vào chỗ {{DATA}}. */
export async function loadPrompt(name: string, data: string): Promise<string> {
  const file = path.join(process.cwd(), "prompts", `${name}.md`);
  const template = await readFile(file, "utf8");
  return template.replace("{{DATA}}", data.trim());
}

/** Biến mảng dòng thành bảng plain text (giống cách dán bảng từ Google Sheet). */
export function toPlainTable(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const lines = [cols.join("\t")];
  for (const r of rows) lines.push(cols.map((c) => r[c] ?? "").join("\t"));
  return lines.join("\n");
}
