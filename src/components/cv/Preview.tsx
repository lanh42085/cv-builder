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
    // Mỗi trang: start = toạ độ (trong nội dung liên tục) hiện ở mép trên vùng lề; end = toạ độ phải che đi
    const [pageSpans, setPageSpans] = useState<{ start: number; end: number }[]>([{ start: 0, end: Infinity }]);

    // Ngắt trang: xếp các khối nguyên tử (data-block) vào trang, giữ lề trên/dưới mọi trang, không cắt giữa khối
    const paginate = () => {
      const root = measure.current;
      if (!root) return;
      const PG = PAGE[cv.style.layout.format];
      const mY = Math.round(cv.style.layout.marginY * 96);
      const avail = PG.h - 2 * mY;
      const rootTop = root.getBoundingClientRect().top;
      const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top - rootTop, bottom: r.bottom - rootTop };
      });
      const spans: { start: number; end: number }[] = [];
      let start = 0;
      let limit = mY + avail;
      for (const b of blocks) {
        if (b.bottom > limit + 0.5 && b.top > start + mY + 1) {
          spans.push({ start, end: b.top });
          start = b.top - mY;
          limit = start + mY + avail;
        }
      }
      spans.push({ start, end: Infinity });
      setPageSpans((prev) => (JSON.stringify(prev) === JSON.stringify(spans) ? prev : spans));
    };

    // Đo lại khi dữ liệu đổi, khi font tải xong, và khi chiều cao nội dung đổi
    useLayoutEffect(() => { paginate(); }, [cv]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
      const root = measure.current;
      if (!root) return;
      const ro = new ResizeObserver(() => paginate());
      ro.observe(root);
      const fonts = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
      fonts?.ready.then(() => paginate());
      return () => ro.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const pages = pageSpans.length;
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
        <div className="rounded-xl bg-neutral-200/70 p-4">
          {pageSpans.map((sp, i) => {
            const PG = PAGE[cv.style.layout.format];
            const maskTop = Number.isFinite(sp.end) ? (sp.end - sp.start) : null;
            return (
              <div key={i} className="relative" style={{ marginBottom: i < pages - 1 ? 16 : 0 }}>
                <div style={{ height: PG.h * scale, width: PG.w * scale }} className="relative mx-auto overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.25)] ring-1 ring-neutral-300">
                  <div style={{ transform: `scale(${scale}) translateY(${-sp.start}px)`, transformOrigin: "top left", width: PG.w }}>
                    <CvTemplate cv={cv} />
                  </div>
                  {maskTop !== null && (
                    <div className="absolute inset-x-0 bottom-0 bg-white" style={{ top: maskTop * scale }} />
                  )}
                  {i > 0 && (
                    <div className="absolute inset-x-0 top-0 bg-white" style={{ height: Math.round(cv.style.layout.marginY * 96) * scale }} />
                  )}
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-neutral-500" style={{ width: PG.w * scale, margin: "4px auto 0" }}>
                  <span>{cv.style.layout.format === "A4" ? "A4 · 210 × 297 mm" : "Letter · 8.5 × 11 in"}</span>
                  <span>Trang {i + 1} / {pages}</span>
                </div>
              </div>
            );
          })}
        </div>
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
