"use client";

import { useState } from "react";
import type { Fmt } from "@/lib/cv/inline";

import type { CvData } from "@/lib/cv/schema";
import { ACCENTS, FONTS, SECTION_LABELS, TEMPLATES, type FontId, type SectionKey, type TemplateId } from "@/lib/cv/style";

export function StyleBar({ cv, set, onFormat, canFormat }: { cv: CvData; set: (fn: (cv: CvData) => CvData) => void; onFormat?: (f: Fmt) => void; canFormat?: boolean }) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const reorder = (from: number, to: number) => set((c) => {
    if (from === to) return c;
    const next = [...c.sectionOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return { ...c, sectionOrder: next };
  });
  const sel = "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs focus:border-[var(--accent)] focus:outline-none";
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-white px-3 py-2">
      <label className="flex items-center gap-1 text-xs text-neutral-600">Mẫu
        <select className={sel} value={cv.templateId} onChange={(e) => set((c) => ({ ...c, templateId: e.target.value as TemplateId }))}>
          {Object.entries(TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1 text-xs text-neutral-600">Font
        <select className={sel} value={cv.style.font} onChange={(e) => set((c) => ({ ...c, style: { ...c.style, font: e.target.value as FontId } }))}>
          {Object.entries(FONTS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-1 text-xs text-neutral-600">Màu
        {ACCENTS.map((c) => (
          <button key={c} type="button" title={c === "#111111" ? "Đen — không màu nhấn" : c} onClick={() => set((x) => ({ ...x, style: { ...x.style, accent: c } }))}
            className={"h-5 w-5 rounded-full border-2 " + (cv.style.accent === c ? "border-neutral-900" : "border-transparent")} style={{ background: c }} />
        ))}
        <input type="color" value={cv.style.accent} title="Màu tự chọn"
          onChange={(e) => set((x) => ({ ...x, style: { ...x.style, accent: e.target.value } }))}
          className="h-6 w-8 cursor-pointer rounded border bg-white p-0" />
      </div>
      {onFormat && (
        <div className="flex items-center gap-1 text-xs text-neutral-600" title={canFormat ? "Áp cho chữ đang bôi đen trên CV" : "Bôi đen chữ trên CV trước"}>Chữ
          <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")}
            className="rounded border bg-white px-2 py-0.5 text-sm font-bold hover:border-[var(--accent)] disabled:opacity-40">B</button>
          <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")}
            className="rounded border bg-white px-2 py-0.5 text-sm italic hover:border-[var(--accent)] disabled:opacity-40">I</button>
        </div>
      )}
      <span className="text-[11px] text-neutral-400">{TEMPLATES[cv.templateId].hint}</span>
      <details className="w-full">
        <summary className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-900">Thứ tự các mục ▾ <span className="text-neutral-400">(kéo thả hoặc bấm mũi tên)</span></summary>
        <ol className="mt-2 grid gap-1">
          {cv.sectionOrder.map((k, i) => (
            <li key={k} draggable
              onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { e.preventDefault(); setOver(i); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, i); setDrag(null); setOver(null); }}
              onDragEnd={() => { setDrag(null); setOver(null); }}
              className={"flex cursor-grab items-center justify-between rounded border px-2 py-1 text-xs active:cursor-grabbing " +
                (over === i && drag !== i ? "border-[var(--accent)] bg-blue-50" : "bg-neutral-50") + (drag === i ? " opacity-40" : "")}>
              <span><span className="mr-2 text-neutral-400">⋮⋮</span>{i + 1}. {SECTION_LABELS[k]}</span>
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => set((c) => ({ ...c, sectionOrder: move(c.sectionOrder, i, -1) }))}
                  className="rounded border px-1.5 hover:bg-white disabled:opacity-30">▲</button>
                <button type="button" disabled={i === cv.sectionOrder.length - 1} onClick={() => set((c) => ({ ...c, sectionOrder: move(c.sectionOrder, i, 1) }))}
                  className="rounded border px-1.5 hover:bg-white disabled:opacity-30">▼</button>
              </span>
            </li>
          ))}
        </ol>
        {cv.templateId === "two-column" && <p className="mt-1 text-[11px] text-neutral-400">Mẫu cột đôi: Skills và Education luôn ở sidebar.</p>}
      </details>
    </div>
  );
}

function move(order: SectionKey[], i: number, d: -1 | 1): SectionKey[] {
  const j = i + d;
  if (j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
