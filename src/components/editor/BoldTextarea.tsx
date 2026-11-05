"use client";

import { useEffect, useRef } from "react";
import { toggleBold } from "@/lib/cv/inline";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; onValueChange: (v: string) => void };

/** Textarea 1 dòng, tự giãn theo nội dung. Ctrl+B trên chữ đang bôi đen → in đậm. */
export function BoldTextarea({ value, onValueChange, className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Tự giãn chiều cao theo nội dung
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function bold() {
    const el = ref.current;
    if (!el) return;
    onValueChange(toggleBold(value, el.selectionStart, el.selectionEnd).value);
    requestAnimationFrame(() => el.focus());
  }

  return (
    <textarea ref={ref} rows={1} value={value} onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); bold(); } }}
      className={(className ?? "") + " resize-none overflow-hidden"} {...rest} />
  );
}
