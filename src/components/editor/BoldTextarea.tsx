"use client";

import { useEffect, useRef } from "react";
import { toggleBold } from "@/lib/cv/inline";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; onValueChange: (v: string) => void; compact?: boolean };

/** Textarea. compact = 1 dòng tự giãn theo nội dung; mặc định 4 dòng. Ctrl+B trên chữ đang bôi đen → in đậm. */
export function BoldTextarea({ value, onValueChange, className, compact, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Tự giãn chiều cao theo nội dung
  useEffect(() => {
    const el = ref.current;
    if (!el || !compact) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, compact]);

  function bold() {
    const el = ref.current;
    if (!el) return;
    onValueChange(toggleBold(value, el.selectionStart, el.selectionEnd).value);
    requestAnimationFrame(() => el.focus());
  }

  return (
    <textarea ref={ref} rows={compact ? 1 : 4} value={value} onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); bold(); } }}
      className={(className ?? "") + (compact ? " resize-none overflow-hidden" : "")} {...rest} />
  );
}
