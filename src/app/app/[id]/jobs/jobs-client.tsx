"use client";

import Link from "next/link";
import { useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { applyTailored, type Tailored } from "@/lib/cv/tailor";
import { Preview } from "@/components/cv/Preview";

type Job = { id: string; job_title: string; jd_text: string; keyword_output: string | null; tailored: Tailored | null; created_at: string };

export function JobsClient({ resumeId, title, cv, initialJobs }: { resumeId: string; title: string; cv: CvData; initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selected, setSelected] = useState<Job | null>(initialJobs[0] ?? null);
  const [jobTitle, setJobTitle] = useState("");
  const [jd, setJd] = useState("");
  const [keywords, setKeywords] = useState("");
  const [busy, setBusy] = useState<"kw" | "apply" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(initialJobs.length === 0);

  async function extract() {
    setBusy("kw"); setError(null);
    const r = await fetch("/api/tailor/keywords", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jdText: jd }) });
    const j = await r.json();
    if (!r.ok) setError(j.error); else setKeywords(j.keywordOutput);
    setBusy(null);
  }

  async function apply() {
    setBusy("apply"); setError(null);
    const r = await fetch("/api/tailor/apply", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeId, jobTitle, jdText: jd, keywordOutput: keywords }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error); setBusy(null); return; }
    const job: Job = { id: j.id, job_title: j.jobTitle, jd_text: jd, keyword_output: keywords, tailored: j.tailored, created_at: j.createdAt };
    setJobs([job, ...jobs]); setSelected(job); setCreating(false);
    setJobTitle(""); setJd(""); setKeywords("");
    setBusy(null);
  }

  const shown = selected?.tailored ? applyTailored(cv, selected.tailored) : cv;
  const textarea = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href={`/app/${resumeId}`} className="text-sm text-neutral-500 hover:text-neutral-900">← Sửa CV gốc</Link>
          <span className="text-sm font-medium">{title} — tùy biến theo job</span>
        </div>
        {selected && (
          <div className="flex gap-2">
            <a href={`/api/export/pdf?id=${resumeId}&job=${selected.id}`} className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-white">Tải PDF bản này</a>
            <a href={`/api/export/docx?id=${resumeId}&job=${selected.id}`} className="rounded-md border px-3 py-1.5 text-sm">Tải DOCX</a>
          </div>
        )}
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border-r bg-neutral-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Các bản theo job</h2>
            <button type="button" onClick={() => setCreating(true)} className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-white">+ Job mới</button>
          </div>

          {jobs.length > 0 && (
            <ul className="mb-4 divide-y rounded-lg border bg-white">
              {jobs.map((j) => (
                <li key={j.id}>
                  <button type="button" onClick={() => { setSelected(j); setCreating(false); }}
                    className={"flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-50 " + (selected?.id === j.id && !creating ? "bg-blue-50" : "")}>
                    <span className="font-medium">{j.job_title}</span>
                    <span className="text-xs text-neutral-400">{new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {creating ? (
            <div className="grid gap-3 rounded-lg border bg-white p-4">
              <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">HR lọc CV bằng keyword trong JD. Đáp ứng 50–70% yêu cầu là đủ để apply. AI chỉ đổi cách diễn đạt và thứ tự — không thêm thứ bạn chưa làm.</p>
              <label className="block"><div className="mb-1 text-sm font-medium">Tên job (để nhớ)</div>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Data Analyst – ABC Retail" className={textarea} /></label>
              <label className="block"><div className="mb-1 text-sm font-medium">Dán nguyên JD</div>
                <textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} className={textarea} /></label>
              <button type="button" onClick={extract} disabled={busy !== null || jd.trim().length < 50}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50">
                {busy === "kw" ? "AI đang đọc JD…" : "1. Trích keyword từ JD"}
              </button>
              {keywords && (
                <>
                  <label className="block"><div className="mb-1 text-sm font-medium">Keyword & phân tích JD (sửa được trước khi lồng)</div>
                    <textarea rows={12} value={keywords} onChange={(e) => setKeywords(e.target.value)} className={textarea + " font-mono text-xs"} /></label>
                  <button type="button" onClick={apply} disabled={busy !== null}
                    className="rounded-md bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50">
                    {busy === "apply" ? "AI đang lồng keyword…" : "2. Lồng vào CV → tạo bản riêng"}
                  </button>
                </>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : selected?.tailored && (
            <div className="grid gap-3">
              <details className="rounded-md border bg-white p-3 text-sm" open>
                <summary className="cursor-pointer font-medium">Keyword đã lồng</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans">{selected.tailored.keywordsUsed || "(AI không liệt kê)"}</pre>
              </details>
              <details className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm" open>
                <summary className="cursor-pointer font-medium text-amber-900">Gợi ý bổ sung — keyword bạn chưa có bằng chứng</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-amber-900">{selected.tailored.suggestions || "(không có)"}</pre>
              </details>
              <details className="rounded-md border bg-white p-3 text-sm">
                <summary className="cursor-pointer font-medium">Phân tích JD</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{selected.keyword_output}</pre>
              </details>
              <details className="rounded-md border bg-white p-3 text-sm">
                <summary className="cursor-pointer font-medium">JD gốc</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs">{selected.jd_text}</pre>
              </details>
            </div>
          )}
        </div>
        <div className="sticky top-0 self-start p-4">
          <Preview cv={shown} />
        </div>
      </div>
    </div>
  );
}
