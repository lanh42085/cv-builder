"use client";

import { createContext, useContext, useRef } from "react";
import { parseInline, serializeInline, type Run } from "@/lib/cv/inline";

/** Khi có context này, chữ trên CV sửa trực tiếp được (bấm vào gõ, Enter/bấm ra ngoài để lưu). */
export const EditCtx = createContext<((path: string, value: string) => void) | null>(null);

function runsFromDom(el: HTMLElement): Run[] {
  const out: Run[] = [];
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) { if (n.textContent) out.push({ text: n.textContent, bold: false, italic: false }); return; }
    const e = n as HTMLElement;
    const t = e.textContent ?? ""; if (!t) return;
    const cs = window.getComputedStyle(e);
    out.push({ text: t, bold: Number(cs.fontWeight) >= 600 || cs.fontWeight === "bold", italic: cs.fontStyle === "italic" });
  });
  return out;
}

/** Hiện chuỗi có **đậm** / __nghiêng__ thành React. */
export function Inline({ text, src }: { text: string; src?: string | null }) {
  const onCommit = useContext(EditCtx);
  const ref = useRef<HTMLSpanElement>(null);
  const inner = parseInline(text).map((r, i) => (
    <span key={i} style={{ fontWeight: r.bold ? 700 : undefined, fontStyle: r.italic ? "italic" : undefined }}>{r.text}</span>
  ));
  if (!src) return <>{inner}</>;
  if (!onCommit) return <span data-src={src}>{inner}</span>;
  return (
    <span ref={ref} data-src={src} contentEditable suppressContentEditableWarning spellCheck={false}
      style={{ outline: "none", borderRadius: 2 }}
      className="hover:bg-[var(--mint)] focus:bg-[var(--mint)]"
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } }}
      onBlur={() => {
        const el = ref.current; if (!el) return;
        const value = serializeInline(runsFromDom(el)).replace(/\s+$/g, "");
        if (value !== text) onCommit(src, value);
      }}>
      {inner}
    </span>
  );
}
