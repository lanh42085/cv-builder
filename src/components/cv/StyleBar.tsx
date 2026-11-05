"use client";

import type { Fmt } from "@/lib/cv/inline";

/** Thanh trên preview: chỉ còn B / I cho chữ đang bôi đen trên CV. */
export function StyleBar({ onFormat, canFormat }: { onFormat?: (f: Fmt) => void; canFormat?: boolean }) {
  if (!onFormat) return null;
  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-neutral-600"
      title={canFormat ? "Áp cho chữ đang bôi đen trên CV" : "Bôi đen chữ trên CV trước"}>
      <span>Chữ đang chọn:</span>
      <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")}
        className="rounded border bg-white px-2.5 py-0.5 text-sm font-bold hover:border-[var(--accent)] disabled:opacity-40">B</button>
      <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")}
        className="rounded border bg-white px-2.5 py-0.5 text-sm italic hover:border-[var(--accent)] disabled:opacity-40">I</button>
      {!canFormat && <span className="text-neutral-400">— bôi đen chữ trên trang CV để in đậm / nghiêng</span>}
    </div>
  );
}
