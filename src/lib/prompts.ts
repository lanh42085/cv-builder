import { readFile } from "node:fs/promises";
import path from "node:path";

/** Đọc prompt từ thư mục prompts/ và ghép dữ liệu vào chỗ {{DATA}}. */
export async function loadPrompt(name: string, data: string): Promise<string> {
  const file = path.join(process.cwd(), "prompts", `${name}.md`);
  const template = await readFile(file, "utf8");
  return template.replace("{{DATA}}", data.trim());
}
