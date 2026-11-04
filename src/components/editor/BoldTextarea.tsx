"use client";

import { useRef } from "react";
import { toggleBold } from "@/lib/cv/inline";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; onValueChange: (v: string) => void };

/** Textarea: Ctrl+B trên chữ đang bôi đen → bọc **…** → in đậm trên CV. (In đậm chủ yếu làm trên preview.) */
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
    <textarea ref={ref} value={value} onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); bold(); } }}
      className={className} {...rest} />
  );
}
