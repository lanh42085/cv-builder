"use client";

import { useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import type { Fmt } from "@/lib/cv/inline";
import { SECTION_LABELS, type SectionKey } from "@/lib/cv/style";

/** Thanh trên preview: B / I cho chữ đang bôi đen + thứ tự các mục. */
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
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j >= 0 && j < cv.sectionOrder.length) reorder(i, j); };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-white px-3 py-2 text-xs text-neutral-600">
      {onFormat && (
        <div className="flex items-center gap-1" title={canFormat ? "Áp cho chữ đang bôi đen trên CV" : "Bôi đen chữ trên CV trước"}>Chữ
          <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")}
            className="rounded border bg-white px-2 py-0.5 text-sm font-bold hover:border-[var(--accent)] disabled:opacity-40">B</button>
          <button type="button" disabled={!canFormat} onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")}
            className="rounded border bg-white px-2 py-0.5 text-sm italic hover:border-[var(--accent)] disabled:opacity-40">I</button>
        </div>
      )}
      <details className="w-full">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg bg-[#1fa4b8] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">↕ Thứ tự các mục <span className="text-xs font-normal opacity-80">kéo thả hoặc bấm mũi tên</span></summary>
        <ol className="mt-2 grid gap-1">
          {cv.sectionOrder.map((k: SectionKey, i) => (
            <li key={k} draggable
              onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { e.preventDefault(); setOver(i); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, i); setDrag(null); setOver(null); }}
              onDragEnd={() => { setDrag(null); setOver(null); }}
              className={"flex cursor-grab items-center justify-between rounded border px-2 py-1 text-xs active:cursor-grabbing " +
                (over === i && drag !== i ? "border-[var(--accent)] bg-[var(--mint)]" : "bg-neutral-50") + (drag === i ? " opacity-40" : "")}>
              <span><span className="mr-2 text-neutral-400">⋮⋮</span>{i + 1}. {SECTION_LABELS[k]}</span>
              <span className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border px-1.5 hover:bg-white disabled:opacity-30">▲</button>
                <button type="button" disabled={i === cv.sectionOrder.length - 1} onClick={() => move(i, 1)} className="rounded border px-1.5 hover:bg-white disabled:opacity-30">▼</button>
              </span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
