"use client";

import type { CvData } from "@/lib/cv/schema";
import { ACCENTS, DATE_FORMATS, DEFAULT_LAYOUT, DEFAULT_SIZES, DEFAULT_STYLE, FONTS, PAGE, type CvLayout, type CvSizes, type DateFormat, type FontId, type PageFormat } from "@/lib/cv/style";

type Props = { cv: CvData; set: (fn: (cv: CvData) => CvData) => void };

const SIZE_ROWS: { key: keyof CvSizes; label: string; min: number; max: number }[] = [
  { key: "name", label: "Tên (Primary Heading)", min: 11, max: 24 },
  { key: "heading", label: "Tiêu đề phụ (công ty, project)", min: 8, max: 14 },
  { key: "body", label: "Chữ thân (Body)", min: 8, max: 13 },
  { key: "section", label: "Tiêu đề mục (Section Titles)", min: 8, max: 14 },
];

export function CustomizePanel({ cv, set }: Props) {
  const st = cv.style;
  const setStyle = (patch: Partial<CvData["style"]>) => set((c) => ({ ...c, style: { ...c.style, ...patch } }));
  const setSize = (k: keyof CvSizes, v: number) => set((c) => ({ ...c, style: { ...c.style, sizes: { ...c.style.sizes, [k]: v } } }));
  const setLayout = (patch: Partial<CvLayout>) => set((c) => ({ ...c, style: { ...c.style, layout: { ...c.style.layout, ...patch } } }));
  const L = st.layout;
  const sel = "w-full rounded-lg border-0 bg-[#eef6f4] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

  return (
    <div className="grid gap-8">
      {/* Font */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Font chữ</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="mb-1 text-sm">Font chính <span className="text-xs text-neutral-400">(tên, tiêu đề)</span></div>
            <select className={sel} value={st.font} onChange={(e) => setStyle({ font: e.target.value as FontId })}>
              {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-sm">Font phụ <span className="text-xs text-neutral-400">(chữ thân)</span></div>
            <select className={sel} value={st.bodyFont} onChange={(e) => setStyle({ bodyFont: e.target.value as FontId })}>
              {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {/* Line height */}
      <section>
        <Slider label="Giãn dòng (Line Height)" value={st.lineHeight} min={1} max={1.8} step={0.01}
          display={`${Math.round(st.lineHeight / DEFAULT_STYLE.lineHeight * 100)}%`}
          onChange={(v) => setStyle({ lineHeight: v })} />
      </section>

      {/* Font size */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Cỡ chữ</h3>
        <div className="grid gap-4">
          {SIZE_ROWS.map((r) => (
            <Slider key={r.key} label={r.label} value={st.sizes[r.key]} min={r.min} max={r.max} step={0.1}
              display={`${st.sizes[r.key].toFixed(1)} pt`} onChange={(v) => setSize(r.key, Math.round(v * 10) / 10)} />
          ))}
        </div>
        <button type="button" className="mt-3 text-xs text-neutral-500 underline hover:text-neutral-900"
          onClick={() => setStyle({ sizes: { ...DEFAULT_SIZES }, lineHeight: DEFAULT_STYLE.lineHeight })}>Về mặc định</button>
      </section>

      {/* Layout */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Bố cục trang (Layout)</h3>
        <label className="mb-4 block">
          <div className="mb-1 text-sm">Khổ giấy</div>
          <select className={sel} value={L.format} onChange={(e) => setLayout({ format: e.target.value as PageFormat })}>
            {Object.entries(PAGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <div className="grid gap-4">
          <Slider label="Lề trên & dưới" value={L.marginY} min={0.2} max={1.2} step={0.01} display={`${L.marginY.toFixed(2)} in`} onChange={(v) => setLayout({ marginY: v })} />
          <Slider label="Lề trái & phải" value={L.marginX} min={0.2} max={1.2} step={0.01} display={`${L.marginX.toFixed(2)} in`} onChange={(v) => setLayout({ marginX: v })} />
          <Slider label="Giữa các mục" value={L.gapSection} min={0} max={24} step={0.5} display={`${L.gapSection} pt`} onChange={(v) => setLayout({ gapSection: v })} />
          <Slider label="Tiêu đề mục ↔ nội dung" value={L.gapTitle} min={0} max={16} step={0.5} display={`${L.gapTitle} pt`} onChange={(v) => setLayout({ gapTitle: v })} />
          <Slider label="Giữa các khối" value={L.gapBlock} min={0} max={16} step={0.5} display={`${L.gapBlock} pt`} onChange={(v) => setLayout({ gapBlock: v })} />
          <Slider label="Trong khối (các dòng)" value={L.gapInner} min={0} max={8} step={0.25} display={`${L.gapInner} pt`} onChange={(v) => setLayout({ gapInner: v })} />
        </div>
        <label className="mt-4 block">
          <div className="mb-1 text-sm">Định dạng ngày</div>
          <select className={sel} value={L.dateFormat} onChange={(e) => setLayout({ dateFormat: e.target.value as DateFormat })}>
            {Object.entries(DATE_FORMATS).map(([k, ex]) => <option key={k} value={k}>{k} — ví dụ {ex}</option>)}
          </select>
        </label>
        <button type="button" className="mt-3 text-xs text-neutral-500 underline hover:text-neutral-900"
          onClick={() => setLayout({ ...DEFAULT_LAYOUT })}>Về mặc định</button>
      </section>

      {/* Màu */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Màu nhấn <span className="normal-case tracking-normal">(tên, tiêu đề, vạch kẻ)</span></h3>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => (
            <button key={c} type="button" title={c === "#111111" ? "Đen — không màu nhấn" : c} onClick={() => setStyle({ accent: c })}
              className={"h-8 w-8 rounded-full border-2 " + (st.accent === c ? "border-neutral-900" : "border-transparent")} style={{ background: c }} />
          ))}
          <label className="ml-2 flex items-center gap-2 text-sm text-neutral-600">Tự chọn
            <input type="color" value={st.accent} onChange={(e) => setStyle({ accent: e.target.value })} className="h-8 w-10 cursor-pointer rounded border bg-white p-0" />
          </label>
        </div>
      </section>

    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-[180px_1fr_64px] items-center gap-3 text-sm">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
      <span className="rounded-md bg-neutral-100 px-2 py-1 text-center text-xs">{display}</span>
    </div>
  );
}
