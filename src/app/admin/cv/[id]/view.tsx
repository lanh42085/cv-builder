"use client";

import { useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import type { CvStyle } from "@/lib/cv/style";
import { applyTailored, type Tailored } from "@/lib/cv/tailor";
import { Preview } from "@/components/cv/Preview";

export type JobRow = { id: string; job_title: string; tailored: Tailored | null; style: CvStyle | null; created_at: string };

export function AdminCvView({ resumeId, cv, jobs }: { resumeId: string; cv: CvData; jobs: JobRow[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const job = jobs.find((j) => j.id === sel) ?? null;
  const base = job?.style ? { ...cv, style: job.style } : cv;
  const shown = job?.tailored ? applyTailored(base, job.tailored) : base;
  const pill = (active: boolean) => "rounded-full px-4 py-2 text-sm font-semibold transition " + (active ? "bg-[#6c5ce7] text-white" : "bg-[#efeafd] text-[#5a4bd1] hover:bg-[#e3dcfb]");
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
          <button type="button" onClick={() => setSel(null)} className={pill(sel === null)}>CV gốc</button>
          {jobs.map((j) => (
            <button key={j.id} type="button" onClick={() => setSel(j.id)} className={pill(sel === j.id)}>
              {j.job_title} <span className="font-normal opacity-70">· {new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
            </button>
          ))}
          <a href={`/api/export/pdf?id=${resumeId}${job ? `&job=${job.id}` : ""}`} className="ml-auto rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Tải PDF</a>
        </div>
        <Preview cv={shown} />
      </div>
    </div>
  );
}
