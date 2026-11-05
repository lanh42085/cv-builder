"use client";

import { useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { ACCENTS, DEFAULT_SIZES, DEFAULT_STYLE, FONTS, SECTION_LABELS, type CvSizes, type FontId, type SectionKey } from "@/lib/cv/style";

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
  const sel = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none";

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
        <Slider label="Giãn dòng (Line Height)" value={st.lineHeight} min={1} max={1.8} step={0.05}
          display={`${Math.round(st.lineHeight / DEFAULT_STYLE.lineHeight * 100)}%`}
          onChange={(v) => setStyle({ lineHeight: v })} />
      </section>

      {/* Font size */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Cỡ chữ</h3>
        <div className="grid gap-4">
          {SIZE_ROWS.map((r) => (
            <Slider key={r.key} label={r.label} value={st.sizes[r.key]} min={r.min} max={r.max} step={0.5}
              display={`${st.sizes[r.key]} pt`} onChange={(v) => setSize(r.key, v)} />
          ))}
        </div>
        <button type="button" className="mt-3 text-xs text-neutral-500 underline hover:text-neutral-900"
          onClick={() => setStyle({ sizes: { ...DEFAULT_SIZES }, lineHeight: DEFAULT_STYLE.lineHeight })}>Về mặc định</button>
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

      {/* Thứ tự mục */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Thứ tự các mục <span className="normal-case tracking-normal">(kéo thả hoặc mũi tên)</span></h3>
        <OrderList cv={cv} set={set} />
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

function OrderList({ cv, set }: Props) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const reorder = (from: number, to: number) => set((c) => {
    if (from === to) return c;
    const next = [...c.sectionOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return { ...c, sectionOrder: next };
  });
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j >= 0 && j < cv.sectionOrder.length) reorder(i, j); };
  return (
    <ol className="grid gap-1">
      {cv.sectionOrder.map((k: SectionKey, i) => (
        <li key={k} draggable
          onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = "move"; }}
          onDragOver={(e) => { e.preventDefault(); setOver(i); }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, i); setDrag(null); setOver(null); }}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          className={"flex cursor-grab items-center justify-between rounded-md border bg-white px-3 py-2 text-sm active:cursor-grabbing " +
            (over === i && drag !== i ? "border-[var(--accent)] bg-[var(--mint)]" : "") + (drag === i ? " opacity-40" : "")}>
          <span><span className="mr-2 text-neutral-400">⋮⋮</span>{i + 1}. {SECTION_LABELS[k]}</span>
          <span className="flex gap-1">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border px-1.5 hover:bg-neutral-50 disabled:opacity-30">▲</button>
            <button type="button" disabled={i === cv.sectionOrder.length - 1} onClick={() => move(i, 1)} className="rounded border px-1.5 hover:bg-neutral-50 disabled:opacity-30">▼</button>
          </span>
        </li>
      ))}
    </ol>
  );
}
