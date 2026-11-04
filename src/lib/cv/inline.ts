/** Định dạng inline tối giản: **đậm**. Dùng cho preview/PDF (React) và DOCX (runs). */

export type Run = { text: string; bold: boolean };

/** Tách chuỗi thành các đoạn đậm/thường. "**" là công tắc bật/tắt, nên chuỗi lệch dấu vẫn đọc được. */
export function parseInline(text: string): Run[] {
  const out: Run[] = [];
  let bold = false;
  for (const seg of text.split("**")) {
    if (seg) out.push({ text: seg, bold });
    bold = !bold;
  }
  return mergeRuns(out);
}

function mergeRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of runs) {
    if (!r.text) continue;
    const last = out[out.length - 1];
    if (last && last.bold === r.bold) last.text += r.text;
    else out.push({ ...r });
  }
  return out;
}

/** Ghép các đoạn thành chuỗi có ** — luôn cân dấu. */
export function serializeInline(runs: Run[]): string {
  return mergeRuns(runs).map((r) => (r.bold ? `**${r.text}**` : r.text)).join("");
}

/** Bỏ dấu ** để lấy chữ thuần. */
export function stripInline(text: string): string {
  return parseInline(text).map((r) => r.text).join("");
}

/**
 * Bật/tắt đậm cho vùng [start, end) tính theo CHỮ HIỂN THỊ (không tính dấu **).
 * Nếu cả vùng đã đậm → bỏ đậm; ngược lại → đậm cả vùng.
 */
export function toggleBoldVisible(src: string, start: number, end: number): string {
  if (end <= start) return src;
  const runs = parseInline(src);
  // Tách runs tại start và end
  const pieces: Run[] = [];
  let pos = 0;
  for (const r of runs) {
    const a = pos, b = pos + r.text.length;
    const cuts = [a, start, end, b].filter((x) => x >= a && x <= b).sort((x, y) => x - y);
    for (let i = 0; i < cuts.length - 1; i++) {
      if (cuts[i + 1] > cuts[i]) pieces.push({ text: r.text.slice(cuts[i] - a, cuts[i + 1] - a), bold: r.bold });
    }
    pos = b;
  }
  // Vùng chọn đã đậm hết chưa?
  let p = 0;
  const inSel = (q: Run) => { const a = p, b = p + q.text.length; p = b; return a >= start && b <= end; };
  const selected = pieces.filter((q) => inSel(q));
  const allBold = selected.length > 0 && selected.every((q) => q.bold);
  // Áp dụng
  p = 0;
  const result = pieces.map((q) => {
    const a = p, b = p + q.text.length; p = b;
    return a >= start && b <= end ? { text: q.text, bold: !allBold } : q;
  });
  return serializeInline(result);
}

/** Offset trong chuỗi gốc (có **) → offset trong chữ hiển thị. */
export function sourceToVisible(src: string, srcOffset: number): number {
  let v = 0, i = 0;
  while (i < src.length && i < srcOffset) {
    if (src.startsWith("**", i)) { i += 2; continue; }
    i++; v++;
  }
  return v;
}

/** Dùng cho textarea: selection tính theo chuỗi gốc. */
export function toggleBold(value: string, start: number, end: number): { value: string; start: number; end: number } {
  const vs = sourceToVisible(value, start), ve = sourceToVisible(value, end);
  const next = toggleBoldVisible(value, vs, ve);
  return { value: next, start: 0, end: 0 };
}
