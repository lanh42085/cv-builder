/** Định dạng inline tối giản: **đậm**, __nghiêng__. Dùng cho preview/PDF (React) và DOCX (runs). */

export type Run = { text: string; bold: boolean; italic: boolean };
export type Fmt = "bold" | "italic";

/** Tách chuỗi thành các đoạn. "**" bật/tắt đậm, "__" bật/tắt nghiêng — chuỗi lệch dấu vẫn đọc được. */
export function parseInline(text: string): Run[] {
  const out: Run[] = [];
  let bold = false, italic = false, buf = "";
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("**", i)) { if (buf) out.push({ text: buf, bold, italic }); buf = ""; bold = !bold; i++; continue; }
    if (text.startsWith("__", i)) { if (buf) out.push({ text: buf, bold, italic }); buf = ""; italic = !italic; i++; continue; }
    buf += text[i];
  }
  if (buf) out.push({ text: buf, bold, italic });
  return mergeRuns(out);
}

function mergeRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of runs) {
    if (!r.text) continue;
    const last = out[out.length - 1];
    if (last && last.bold === r.bold && last.italic === r.italic) last.text += r.text;
    else out.push({ ...r });
  }
  return out;
}

/** Ghép các đoạn thành chuỗi có dấu — luôn cân dấu. */
export function serializeInline(runs: Run[]): string {
  return mergeRuns(runs).map((r) => {
    let t = r.text;
    if (r.italic) t = `__${t}__`;
    if (r.bold) t = `**${t}**`;
    return t;
  }).join("");
}

export function stripInline(text: string): string {
  return parseInline(text).map((r) => r.text).join("");
}

/** Bật/tắt một kiểu cho vùng [start, end) tính theo CHỮ HIỂN THỊ. Cả vùng đã có kiểu → bỏ; ngược lại → áp cả vùng. */
export function toggleFmtVisible(src: string, start: number, end: number, fmt: Fmt): string {
  if (end <= start) return src;
  const runs = parseInline(src);
  const pieces: Run[] = [];
  let pos = 0;
  for (const r of runs) {
    const a = pos, b = pos + r.text.length;
    const cuts = [a, start, end, b].filter((x) => x >= a && x <= b).sort((x, y) => x - y);
    for (let i = 0; i < cuts.length - 1; i++) {
      if (cuts[i + 1] > cuts[i]) pieces.push({ ...r, text: r.text.slice(cuts[i] - a, cuts[i + 1] - a) });
    }
    pos = b;
  }
  let p = 0;
  const flags = pieces.map((q) => { const a = p, b = p + q.text.length; p = b; return a >= start && b <= end; });
  const selected = pieces.filter((_, i) => flags[i]);
  const allOn = selected.length > 0 && selected.every((q) => q[fmt]);
  const result = pieces.map((q, i) => (flags[i] ? { ...q, [fmt]: !allOn } : q));
  return serializeInline(result);
}

export const toggleBoldVisible = (src: string, s: number, e: number) => toggleFmtVisible(src, s, e, "bold");

/** Offset trong chuỗi gốc (có dấu) → offset trong chữ hiển thị. */
export function sourceToVisible(src: string, srcOffset: number): number {
  let v = 0, i = 0;
  while (i < src.length && i < srcOffset) {
    if (src.startsWith("**", i) || src.startsWith("__", i)) { i += 2; continue; }
    i++; v++;
  }
  return v;
}

/** Dùng cho textarea: selection tính theo chuỗi gốc. */
export function toggleBold(value: string, start: number, end: number): { value: string; start: number; end: number } {
  const next = toggleFmtVisible(value, sourceToVisible(value, start), sourceToVisible(value, end), "bold");
  return { value: next, start: 0, end: 0 };
}
