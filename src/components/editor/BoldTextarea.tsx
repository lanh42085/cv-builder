"use client";

import { useRef } from "react";
import { toggleBold } from "@/lib/cv/inline";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; onValueChange: (v: string) => void };

/** Textarea có nút B: bôi đen chữ rồi bấm B (hoặc Ctrl+B) → bọc **…** → in đậm trên CV. */
export function BoldTextarea({ value, onValueChange, className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function bold() {
    const el = ref.current;
    if (!el) return;
    const r = toggleBold(value, el.selectionStart, el.selectionEnd);
    onValueChange(r.value);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(r.start, r.end); });
  }

  return (
    <div className="relative">
      <textarea ref={ref} value={value} onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); bold(); } }}
        className={className} {...rest} />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={bold} title="In đậm chữ đang bôi đen (Ctrl+B)"
        className="absolute right-1.5 top-1.5 rounded border bg-white px-1.5 text-xs font-bold text-neutral-600 hover:border-[var(--accent)] hover:text-[var(--accent)]">
        B
      </button>
    </div>
  );
}
