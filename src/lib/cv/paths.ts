import type { CvData } from "./schema";

/**
 * Đường dẫn tới một chuỗi trong CvData, để sửa trực tiếp từ preview.
 * Dạng "a.b.0.c" (đi theo object/array) hoặc "raw.skills.hard@2" (dòng thứ 2 trong chuỗi nhiều dòng).
 */
const LABEL_RE = /^(\s*)(?:\*\*([^*]+?):?\*\*\s*|([^:*]{1,40}):\s+)([\s\S]*)$/;
function splitLabel(line: string): { label: string; text: string } {
  const m = line.match(LABEL_RE);
  if (!m) return { label: "", text: line };
  return { label: (m[2] ?? m[3] ?? "").trim(), text: m[4] ?? "" };
}

export function getText(cv: CvData, path: string): string {
  if (path.endsWith(":label")) {
    return splitLabel(getText(cv, path.slice(0, -6))).label;
  }
  if (path.includes("#")) {
    const [base, k] = path.split("#");
    const parts = getText(cv, base).split("|").map((x) => x.trim());
    return k === "0" ? (parts[0] ?? "") : parts.slice(1).join(" | ");
  }
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
  if (path.endsWith(":label")) {
    const base = path.slice(0, -6);
    const { text } = splitLabel(getText(cv, base));
    const label = value.trim().replace(/:$/, "");
    return setText(cv, base, label ? `**${label}:** ${text}` : text);
  }
  if (path.includes("#")) {
    const [base, k] = path.split("#");
    const parts = getText(cv, base).split("|").map((x) => x.trim());
    const first = k === "0" ? value.trim() : (parts[0] ?? "");
    const rest = k === "0" ? parts.slice(1).join(" | ") : value.trim();
    return setText(cv, base, rest ? `${first} | ${rest}` : first);
  }
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

/** Xoá phần tử/dòng mà path trỏ tới (bullet trong mảng, dòng "@i" trong chuỗi nhiều dòng). Không áp dụng được → trả về cv cũ. */
export function removeAt(cv: CvData, path: string): CvData {
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
  if (line !== undefined) {
    const lines = String(cur[last] ?? "").split("\n");
    lines.splice(Number(line), 1);
    cur[last] = lines.join("\n");
    return next as unknown as CvData;
  }
  if (Array.isArray(cur) && /^\d+$/.test(last)) {
    (cur as unknown as unknown[]).splice(Number(last), 1);
    return next as unknown as CvData;
  }
  return cv;
}

/** Chèn một phần tử/dòng trống ngay sau vị trí path trỏ tới. */
export function insertAfter(cv: CvData, path: string, value = ""): CvData {
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
  if (line !== undefined) {
    const lines = String(cur[last] ?? "").split("\n");
    lines.splice(Number(line) + 1, 0, value);
    cur[last] = lines.join("\n");
    return next as unknown as CvData;
  }
  if (Array.isArray(cur) && /^\d+$/.test(last)) {
    (cur as unknown as unknown[]).splice(Number(last) + 1, 0, value);
    return next as unknown as CvData;
  }
  return cv;
}

/** Bỏ bullet / dòng skill trống (dòng thêm bằng nút + rồi bỏ dở). */
export function pruneEmpty(cv: CvData): CvData {
  const next = structuredClone(cv);
  for (const sec of [next.generated.experience, next.generated.projects]) for (const s of sec) s.bullets = s.bullets.filter((b) => b.trim());
  next.raw.skills.hard = next.raw.skills.hard.split("\n").filter((l) => l.trim()).join("\n");
  next.raw.skills.soft = next.raw.skills.soft.split("\n").filter((l) => l.trim()).join("\n");
  return next;
}
