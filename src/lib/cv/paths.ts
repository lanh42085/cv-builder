import type { CvData } from "./schema";

/**
 * Đường dẫn tới một chuỗi trong CvData, để sửa trực tiếp từ preview.
 * Dạng "a.b.0.c" (đi theo object/array) hoặc "raw.skills.hard@2" (dòng thứ 2 trong chuỗi nhiều dòng).
 */
export function getText(cv: CvData, path: string): string {
  const [p, line] = path.split("@");
  let cur: unknown = cv;
  for (const seg of p.split(".")) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[seg];
  }
  const s = typeof cur === "string" ? cur : "";
  return line === undefined ? s : (s.split("\n")[Number(line)] ?? "");
}

export function setText(cv: CvData, path: string, value: string): CvData {
  const [p, line] = path.split("@");
  const next = structuredClone(cv) as unknown as Record<string, unknown>;
  const segs = p.split(".");
  let cur: Record<string, unknown> = next;
  for (const seg of segs.slice(0, -1)) {
    const n = cur[seg];
    if (n == null || typeof n !== "object") return cv;
    cur = n as Record<string, unknown>;
  }
  const last = segs[segs.length - 1];
  if (line === undefined) { cur[last] = value; }
  else {
    const lines = String(cur[last] ?? "").split("\n");
    lines[Number(line)] = value;
    cur[last] = lines.join("\n");
  }
  return next as unknown as CvData;
}
