"use client";

import { useEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { toView } from "@/lib/cv/view";
import { toggleBoldVisible } from "@/lib/cv/inline";
import { getText, setText } from "@/lib/cv/paths";
import { CvTemplate } from "./CvTemplate";

type Sel = { path: string; start: number; end: number; x: number; y: number };

/** Khung A4 thu nhỏ; có `set` thì bôi đen chữ trên trang → nút B nổi để in đậm. */
export function Preview({ cv, set }: { cv: CvData; set?: (fn: (cv: CvData) => CvData) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [sel, setSel] = useState<Sel | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onMouseUp() {
    if (!set) return;
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) { setSel(null); return; }
    const range = s.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = (node.nodeType === 3 ? node.parentElement : (node as Element))?.closest<HTMLElement>("[data-src]");
    if (!el || !ref.current?.contains(el)) { setSel(null); return; }
    // offset hiển thị: độ dài chữ từ đầu phần tử tới đầu/cuối vùng chọn
    const pre = document.createRange(); pre.selectNodeContents(el); pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const end = start + range.toString().length;
    if (end <= start) { setSel(null); return; }
    const r = range.getBoundingClientRect(), box = ref.current.getBoundingClientRect();
    setSel({ path: el.dataset.src!, start, end, x: r.left - box.left + r.width / 2, y: r.top - box.top });
  }

  function applyBold() {
    if (!sel || !set) return;
    set((c) => setText(c, sel.path, toggleBoldVisible(getText(c, sel.path), sel.start, sel.end)));
    setSel(null);
    window.getSelection()?.removeAllRanges();
  }

  const isDraft = toView(cv).isDraft;
  return (
    <div ref={ref} className="relative w-full" onMouseUp={onMouseUp}>
      {isDraft && (
        <p className="mb-2 text-xs text-neutral-500">
          Bản nháp ghép từ dữ liệu thô. Bấm “Tạo bằng AI” ở các bước About Me, Experience, Projects để AI viết lại câu chữ.
        </p>
      )}
      {set && !isDraft && <p className="mb-2 text-xs text-neutral-400">Mẹo: bôi đen chữ ngay trên trang này rồi bấm B để in đậm.</p>}
      <div style={{ height: 1123 * scale }} className="overflow-hidden rounded shadow-lg">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}>
          <CvTemplate cv={cv} />
        </div>
      </div>
      {sel && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={applyBold}
          style={{ left: sel.x, top: sel.y - 34 }}
          className="absolute z-20 -translate-x-1/2 rounded-md border bg-white px-2.5 py-1 text-sm font-bold shadow-lg hover:border-[var(--accent)] hover:text-[var(--accent)]"
          title="In đậm / bỏ đậm chữ đang bôi đen">
          B
        </button>
      )}
    </div>
  );
}
