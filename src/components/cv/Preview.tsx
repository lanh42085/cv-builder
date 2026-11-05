"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { toView } from "@/lib/cv/view";
import { toggleFmtVisible, type Fmt } from "@/lib/cv/inline";
import { getText, setText } from "@/lib/cv/paths";
import { CvTemplate } from "./CvTemplate";
import { PAGE } from "@/lib/cv/style";

type Sel = { path: string; start: number; end: number; x: number; y: number };
export type PreviewHandle = { format: (fmt: Fmt) => void; hasSelection: boolean };

/** Khung A4 thu nhỏ; có `set` thì bôi đen chữ trên trang → nút B/I nổi để định dạng. */
export const Preview = forwardRef<PreviewHandle, { cv: CvData; set?: (fn: (cv: CvData) => CvData) => void; onSelectionChange?: (has: boolean) => void }>(
  function Preview({ cv, set, onSelectionChange }, handle) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.6);
    const [sel, setSelState] = useState<Sel | null>(null);
    const measure = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState(1);

    // Đo chiều cao nội dung → số trang A4
    useLayoutEffect(() => {
      const el = measure.current;
      if (!el) return;
      const h = el.scrollHeight;
      setPages(Math.max(1, Math.ceil((h - 2) / PAGE[cv.style.layout.format].h)));
    }, [cv]);
    const setSel = (s: Sel | null) => { setSelState(s); onSelectionChange?.(Boolean(s)); };

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PAGE[cv.style.layout.format].w)));
      ro.observe(el);
      return () => ro.disconnect();
    }, [cv.style.layout.format]);

    function onMouseUp() {
      if (!set) return;
      const s = window.getSelection();
      if (!s || s.isCollapsed || s.rangeCount === 0) { setSel(null); return; }
      const range = s.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = (node.nodeType === 3 ? node.parentElement : (node as Element))?.closest<HTMLElement>("[data-src]");
      if (!el || !ref.current?.contains(el)) { setSel(null); return; }
      const pre = document.createRange(); pre.selectNodeContents(el); pre.setEnd(range.startContainer, range.startOffset);
      const start = pre.toString().length;
      const end = start + range.toString().length;
      if (end <= start) { setSel(null); return; }
      const r = range.getBoundingClientRect(), box = ref.current.getBoundingClientRect();
      setSel({ path: el.dataset.src!, start, end, x: r.left - box.left + r.width / 2, y: r.top - box.top });
    }

    function format(fmt: Fmt) {
      if (!sel || !set) return;
      const cur = sel;
      set((c) => setText(c, cur.path, toggleFmtVisible(getText(c, cur.path), cur.start, cur.end, fmt)));
      // Giữ vùng chọn để có thể bấm tiếp (đậm rồi nghiêng)
    }

    useImperativeHandle(handle, () => ({ format, hasSelection: Boolean(sel) }), [sel, set]); // eslint-disable-line react-hooks/exhaustive-deps

    const isDraft = toView(cv).isDraft;
    const btn = "rounded-md border bg-white px-2.5 py-1 text-sm shadow-lg hover:border-[var(--accent)] hover:text-[var(--accent)]";
    return (
      <div ref={ref} className="relative w-full" onMouseUp={onMouseUp}>
        {isDraft && (
          <p className="mb-2 text-xs text-neutral-500">
            Bản nháp ghép từ dữ liệu thô. Bấm “Tạo bằng AI” ở các bước About Me, Experience, Projects để AI viết lại câu chữ.
          </p>
        )}
        {set && !isDraft && <p className="mb-2 text-xs text-neutral-400">Mẹo: bôi đen chữ ngay trên trang này rồi bấm B (đậm) hoặc I (nghiêng).</p>}
        {/* Bản đo chiều cao (ẩn) */}
        <div style={{ position: "absolute", left: -99999, top: 0, width: PAGE[cv.style.layout.format].w, visibility: "hidden" }} aria-hidden>
          <div ref={measure}><CvTemplate cv={cv} /></div>
        </div>
        {Array.from({ length: pages }, (_, i) => (
          <div key={i} className="relative">
            {pages > 1 && <div className="mb-1 text-right text-[11px] text-neutral-400">Trang {i + 1} / {pages}</div>}
            <div style={{ height: PAGE[cv.style.layout.format].h * scale }} className="mb-4 overflow-hidden rounded bg-white shadow-lg">
              <div style={{ transform: `scale(${scale}) translateY(${-i * PAGE[cv.style.layout.format].h}px)`, transformOrigin: "top left", width: PAGE[cv.style.layout.format].w }}>
                <CvTemplate cv={cv} />
              </div>
            </div>
          </div>
        ))}
        {pages > 1 && <p className="text-xs text-amber-700">CV đang dài {pages} trang. Với fresher nên gọn 1 trang: rút bullet hoặc giảm cỡ chữ / giãn dòng trong Customize.</p>}
        {sel && (
          <div style={{ left: sel.x, top: sel.y - 36 }} className="absolute z-20 flex -translate-x-1/2 gap-1">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")} className={btn + " font-bold"} title="In đậm">B</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")} className={btn + " italic"} title="In nghiêng">I</button>
          </div>
        )}
      </div>
    );
  },
);
