/** Biến mảng dòng thành bảng plain text (giống cách dán bảng từ Google Sheet). Dùng được cả client lẫn server. */
export function toPlainTable(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const lines = [cols.join("\t")];
  for (const r of rows) lines.push(cols.map((c) => r[c] ?? "").join("\t"));
  return lines.join("\n");
}
