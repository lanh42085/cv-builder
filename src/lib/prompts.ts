import { readFile } from "node:fs/promises";
import path from "node:path";

export type SplitPrompt = { system: string; user: string };

/**
 * Đọc prompt từ thư mục prompts/ và tách làm 2 phần để dùng prompt caching:
 * - system: phần hướng dẫn cố định đứng TRƯỚC chỗ ghép dữ liệu (giống nhau mọi lần → được cache)
 * - user:   từ chỗ ghép dữ liệu trở đi, đã thay {{DATA}} / {{KEYWORDS}} bằng dữ liệu thật
 * Nội dung prompt không đổi; chỉ chia chỗ gửi.
 */
export async function loadPromptSplit(name: string, vars: Record<string, string>): Promise<SplitPrompt> {
  const file = path.join(process.cwd(), "prompts", `${name}.md`);
  const template = await readFile(file, "utf8");
  const firstVar = Math.min(...Object.keys(vars).map((k) => template.indexOf(`{{${k}}}`)).filter((i) => i >= 0));
  const cut = Number.isFinite(firstVar) ? firstVar : template.length;
  let user = template.slice(cut);
  for (const [k, v] of Object.entries(vars)) user = user.replace(`{{${k}}}`, v.trim());
  return { system: template.slice(0, cut).trimEnd(), user: user.trim() };
}

/** Bản cũ: ghép dữ liệu vào một chuỗi duy nhất. */
export async function loadPrompt(name: string, data: string): Promise<string> {
  const file = path.join(process.cwd(), "prompts", `${name}.md`);
  const template = await readFile(file, "utf8");
  return template.replace("{{DATA}}", data.trim());
}
