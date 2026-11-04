/** Định dạng inline tối giản: **đậm**. Dùng cho preview/PDF (React) và DOCX (runs). */

export type Run = { text: string; bold: boolean };

export function parseInline(text: string): Run[] {
  const out: Run[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), bold: false });
    out.push({ text: m[1], bold: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false });
  return out;
}

/** Bỏ dấu ** để lấy chữ thuần (ví dụ cho tên file, so khớp). */
export function stripInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** Bọc đoạn [start, end) của chuỗi bằng ** — nếu đã bọc thì gỡ. */
export function toggleBold(value: string, start: number, end: number): { value: string; start: number; end: number } {
  if (start === end) return { value, start, end };
  const sel = value.slice(start, end);
  const before = value.slice(0, start), after = value.slice(end);
  if (sel.startsWith("**") && sel.endsWith("**") && sel.length >= 4) {
    const inner = sel.slice(2, -2);
    return { value: before + inner + after, start, end: start + inner.length };
  }
  if (before.endsWith("**") && after.startsWith("**")) {
    return { value: before.slice(0, -2) + sel + after.slice(2), start: start - 2, end: end - 2 };
  }
  return { value: `${before}**${sel}**${after}`, start, end: end + 4 };
}
