"use client";

import type { CvData } from "@/lib/cv/schema";
import { ACCENTS, FONTS, TEMPLATES, type FontId, type TemplateId } from "@/lib/cv/style";

export function StyleBar({ cv, set }: { cv: CvData; set: (fn: (cv: CvData) => CvData) => void }) {
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
          <button key={c} type="button" title={c} onClick={() => set((x) => ({ ...x, style: { ...x.style, accent: c } }))}
            className={"h-5 w-5 rounded-full border-2 " + (cv.style.accent === c ? "border-neutral-900" : "border-transparent")} style={{ background: c }} />
        ))}
        <input type="color" value={cv.style.accent} title="Màu tự chọn"
          onChange={(e) => set((x) => ({ ...x, style: { ...x.style, accent: e.target.value } }))}
          className="h-6 w-8 cursor-pointer rounded border bg-white p-0" />
      </div>
      <span className="text-[11px] text-neutral-400">{TEMPLATES[cv.templateId].hint}</span>
    </div>
  );
}
