import { createContext, useContext, useRef } from "react";
import { parseInline, serializeInline, type Run } from "@/lib/cv/inline";

/** Khi có context này, chữ trên CV sửa trực tiếp được (bấm vào gõ, Enter/bấm ra ngoài để lưu). */
export type EditApi = { commit: (path: string, value: string) => void; insert: (path: string) => void };
export const EditCtx = createContext<EditApi | null>(null);

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
  const api = useContext(EditCtx);
  const ref = useRef<HTMLSpanElement>(null);
  const inner = parseInline(text).map((r, i) => (
    <span key={i} style={{ fontWeight: r.bold ? 700 : undefined, fontStyle: r.italic ? "italic" : undefined }}>{r.text}</span>
  ));
  if (!src) return <>{inner}</>;
  if (!api) return <span data-src={src}>{inner}</span>;
  return (
    <span ref={ref} data-src={src} contentEditable suppressContentEditableWarning spellCheck={false}
      style={{ outline: "none", borderRadius: 2 }}
      className="hover:bg-[var(--mint)] focus:bg-[var(--mint)]"
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); } }}
      onBlur={() => {
        const el = ref.current; if (!el) return;
        const value = serializeInline(runsFromDom(el)).replace(/\s+$/g, "");
        if (value !== text) api.commit(src, value);
      }}>
      {inner}
    </span>
  );
}

/** Nút "+" nhỏ (chỉ khi đang sửa trực tiếp) chèn một bullet trống sau bullet có path này. */
export function AddAfter({ path }: { path: string }) {
  const api = useContext(EditCtx);
  if (!api) return null;
  return (
    <button type="button" contentEditable={false} title="Thêm bullet dưới dòng này" onMouseDown={(e) => e.preventDefault()} onClick={() => api.insert(path)}
      style={{ position: "absolute", right: -22, top: 0, width: 16, height: 16, lineHeight: "14px", fontSize: 12, borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#00b090", cursor: "pointer", padding: 0 }}
      className="print:hidden opacity-0 group-hover:opacity-100 hover:opacity-100">+</button>
  );
}
