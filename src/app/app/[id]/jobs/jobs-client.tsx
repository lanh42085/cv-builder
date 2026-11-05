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
  const [busy, setBusy] = useState<"kw" | "apply" | "redo" | "del" | null>(null);
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

  async function redo() {
    if (!selected) return;
    setBusy("redo"); setError(null);
    const r = await fetch("/api/tailor/apply", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeId, jobId: selected.id, jobTitle: selected.job_title, jdText: selected.jd_text, keywordOutput: selected.keyword_output ?? "" }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error); setBusy(null); return; }
    const job: Job = { ...selected, tailored: j.tailored };
    setJobs(jobs.map((x) => (x.id === job.id ? job : x))); setSelected(job);
    setBusy(null);
  }

  async function remove() {
    if (!selected || !confirm(`Xóa bản "${selected.job_title}"?`)) return;
    setBusy("del"); setError(null);
    const r = await fetch(`/api/jobs/${selected.id}`, { method: "DELETE" });
    if (!r.ok) { setError((await r.json()).error); setBusy(null); return; }
    const rest = jobs.filter((x) => x.id !== selected.id);
    setJobs(rest); setSelected(rest[0] ?? null); if (!rest.length) setCreating(true);
    setBusy(null);
  }

  const shown = selected?.tailored ? applyTailored(cv, selected.tailored) : cv;
  const textarea = "w-full rounded-lg border-0 bg-[#eef6f4] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-[#e3f0ec] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

  return (
    <div className="flex min-h-screen flex-col bg-[#e6f4f1]">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href={`/app/${resumeId}`} className="text-sm text-neutral-500 hover:text-neutral-900">← Sửa CV gốc</Link>
          <span className="text-sm font-medium">{title} — tùy biến theo job</span>
        </div>
        {selected && (
          <div className="flex gap-2">
            <a href={`/api/export/pdf?id=${resumeId}&job=${selected.id}`} className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">Tải PDF bản này</a>
            <a href={`/api/export/docx?id=${resumeId}&job=${selected.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Tải DOCX</a>
          </div>
        )}
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-3">
          <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-1 flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-neutral-900">Tùy biến theo từng JD</h2>
            <button type="button" onClick={() => setCreating(true)} className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">+ Job mới</button>
          </div>
          <p className="mb-5 text-sm text-neutral-500">Mỗi job một bản CV riêng. HR lọc bằng keyword trong JD; đáp ứng 50–70% là đủ để apply. AI chỉ đổi cách diễn đạt và thứ tự — không thêm thứ bạn chưa làm.</p>

          {jobs.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {jobs.map((j) => (
                <button key={j.id} type="button" onClick={() => { setSelected(j); setCreating(false); }}
                  className={"rounded-full px-3 py-1.5 text-xs transition " + (selected?.id === j.id && !creating ? "bg-[var(--navy)] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200")}>
                  {j.job_title} <span className={selected?.id === j.id && !creating ? "opacity-60" : "text-neutral-400"}>· {new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
                </button>
              ))}
            </div>
          )}

          {creating ? (
            <div className="grid gap-4">
              <label className="block"><div className="mb-1.5 text-sm text-neutral-500">Tên job (để nhớ)</div>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Data Analyst – ABC Retail" className={textarea} /></label>
              <label className="block"><div className="mb-1.5 text-sm text-neutral-500">Dán nguyên JD</div>
                <textarea rows={8} value={jd} onChange={(e) => setJd(e.target.value)} className={textarea} /></label>
              <button type="button" onClick={extract} disabled={busy !== null || jd.trim().length < 50}
                className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {busy === "kw" ? "AI đang đọc JD…" : "1. Trích keyword từ JD"}
              </button>
              {keywords && (
                <>
                  <label className="block"><div className="mb-1.5 text-sm text-neutral-500">Keyword & phân tích JD · sửa được trước khi lồng</div>
                    <textarea rows={12} value={keywords} onChange={(e) => setKeywords(e.target.value)} className={textarea + " font-mono text-xs"} /></label>
                  <button type="button" onClick={apply} disabled={busy !== null}
                    className="rounded-lg bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                    {busy === "apply" ? "AI đang lồng keyword…" : "2. Lồng vào CV → tạo bản riêng"}
                  </button>
                </>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          ) : selected?.tailored && (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={redo} disabled={busy !== null}
                  className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                  {busy === "redo" ? "AI đang lồng lại…" : "↻ Làm lại theo CV gốc hiện tại"}
                </button>
                <button type="button" onClick={remove} disabled={busy !== null}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
                  {busy === "del" ? "Đang xóa…" : "Xóa job"}
                </button>
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>
              <details className="rounded-xl border border-neutral-200 bg-white p-4 text-sm" open>
                <summary className="cursor-pointer font-medium">Keyword đã lồng</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans">{selected.tailored.keywordsUsed || "(AI không liệt kê)"}</pre>
              </details>
              <details className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm" open>
                <summary className="cursor-pointer font-medium text-amber-900">Gợi ý bổ sung — keyword bạn chưa có bằng chứng</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-amber-900">{selected.tailored.suggestions || "(không có)"}</pre>
              </details>
              <details className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
                <summary className="cursor-pointer font-medium">Phân tích JD</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{selected.keyword_output}</pre>
              </details>
              <details className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
                <summary className="cursor-pointer font-medium">JD gốc</summary>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs">{selected.jd_text}</pre>
              </details>
            </div>
          )}
          </div>
        </div>
        <div className="sticky top-0 self-start p-3">
          <Preview cv={shown} />
        </div>
      </div>
    </div>
  );
}
