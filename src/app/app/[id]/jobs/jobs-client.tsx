"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { applyTailored, type Tailored } from "@/lib/cv/tailor";
import { Preview, type PreviewHandle } from "@/components/cv/Preview";
import { StyleBar } from "@/components/cv/StyleBar";
import { normalizeCv } from "@/lib/cv/schema";
import { CustomizePanel } from "@/components/editor/CustomizePanel";
import type { CvStyle } from "@/lib/cv/style";

type Job = { id: string; job_title: string; jd_text: string; keyword_output: string | null; tailored: Tailored | null; style: CvStyle | null; cv_override: unknown | null; created_at: string };

export function JobsClient({ resumeId, title, cv, initialJobs }: { resumeId: string; title: string; cv: CvData; initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selected, setSelected] = useState<Job | null>(initialJobs[0] ?? null);
  const [mode, setMode] = useState<"edit" | "customize">("edit");
  const [styleSave, setStyleSave] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const latest = useRef(selected); latest.current = selected;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<PreviewHandle>(null);
  const [canFormat, setCanFormat] = useState(false);
  const flush = useCallback(async () => {
    const j = latest.current; if (!j) return;
    setStyleSave("saving");
    const r = await fetch(`/api/jobs/${j.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ style: j.style, cv_override: j.cv_override }) });
    setStyleSave(r.ok ? "saved" : "error");
  }, []);
  /** Bản job đang hiện: bản chụp riêng (nếu đã sửa tay) hoặc ghép từ CV gốc + keyword đã lồng. */
  const shownOf = useCallback((j: Job | null): CvData => {
    if (!j) return cv;
    if (j.cv_override) return normalizeCv(j.cv_override);
    const base = j.style ? { ...cv, style: j.style } : cv;
    return j.tailored ? applyTailored(base, j.tailored) : base;
  }, [cv]);
  /** Mọi chỉnh sửa trên trang này (format, B/I, thứ tự, sửa chữ) chỉ vào bản job đang chọn, CV gốc giữ nguyên. */
  const set = useCallback((fn: (c: CvData) => CvData) => {
    setSelected((j) => {
      if (!j) return j;
      const nextCv = fn(shownOf(j));
      const next: Job = { ...j, cv_override: nextCv, style: nextCv.style };
      setJobs((list) => list.map((x) => (x.id === next.id ? next : x)));
      return next;
    });
    setStyleSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1500);
  }, [shownOf, flush]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
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
    const job: Job = { id: j.id, job_title: j.jobTitle, jd_text: jd, keyword_output: keywords, tailored: j.tailored, style: null, cv_override: null, created_at: j.createdAt };
    setJobs([job, ...jobs]); setSelected(job); setCreating(false);
    setJobTitle(""); setJd(""); setKeywords("");
    setBusy(null);
  }

  async function redo() {
    if (!selected) return;
    if (selected.cv_override && !confirm("Bản này đã được sửa tay. Làm lại sẽ bỏ các sửa tay và lồng lại từ CV gốc hiện tại. Tiếp tục?")) return;
    setBusy("redo"); setError(null);
    const r = await fetch("/api/tailor/apply", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeId, jobId: selected.id, jobTitle: selected.job_title, jdText: selected.jd_text, keywordOutput: selected.keyword_output ?? "" }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error); setBusy(null); return; }
    const job: Job = { ...selected, tailored: j.tailored, cv_override: null };
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

  const shown = shownOf(selected);
  const base = shown;
  const textarea = "w-full rounded-lg border-0 bg-[#eef6f4] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-[#e3f0ec] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

  return (
    <div className="flex h-screen flex-col bg-[#e6f4f1]">
      <header className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--navy)" }}><Image src="/logo.png" alt="UniGap" width={26} height={28} /> UniGap <span style={{ color: "var(--accent)" }}>CV Builder</span></Link>
          <Link href={`/app/${resumeId}`} className="rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--mint)]">← Sửa CV gốc</Link>
          <span className="text-sm font-medium">{title} — tùy biến theo JD</span>
        </div>
        <div className="flex rounded-full bg-[#d7efe8] p-1 text-sm">
          {(["edit", "customize"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={"rounded-full px-4 py-1.5 font-semibold transition " + (mode === m ? "bg-[var(--accent)] text-white shadow" : "text-[var(--accent-dark)] hover:bg-white/60")}>
              {m === "edit" ? "Edit nội dung" : "Format"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selected && (<>
            <a href={`/api/export/pdf?id=${resumeId}&job=${selected.id}`} className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">Tải PDF bản này</a>
            <a href={`/api/export/docx?id=${resumeId}&job=${selected.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">Tải DOCX</a>
          </>)}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-h-0 overflow-y-auto overflow-x-hidden p-3">
          <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:p-8">
          {mode === "customize" ? (<>
            <h2 className="text-2xl font-bold text-neutral-900">Tùy chỉnh chữ & bố cục</h2>
            <p className="mb-6 mt-1 text-sm text-neutral-500">{selected ? <>Chỉ áp cho bản <b>{selected.job_title}</b>, không đổi CV gốc. {{ saved: "Đã lưu.", dirty: "Chưa lưu…", saving: "Đang lưu…", error: "Lưu lỗi." }[styleSave]}</> : "Chọn một bản job trước."}</p>
            {selected && <CustomizePanel cv={base} set={set} />}
          </>) : (<>
          <div className="mb-1 flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-neutral-900">Tùy biến theo từng JD</h2>
            <button type="button" onClick={() => setCreating(true)} className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">+ Job mới</button>
          </div>
          <p className="mb-5 text-sm text-neutral-500">Mỗi job một bản CV riêng. HR lọc bằng keyword trong JD; đáp ứng 50–70% là đủ để apply. AI chỉ đổi cách diễn đạt và thứ tự — không thêm thứ bạn chưa làm.</p>

          {jobs.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {jobs.map((j) => (
                <button key={j.id} type="button" onClick={() => { setSelected(j); setCreating(false); }}
                  className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (selected?.id === j.id && !creating ? "bg-[#6c5ce7] text-white" : "bg-[#efeafd] text-[#5a4bd1] hover:bg-[#e3dcfb]")}>
                  {j.job_title} <span className="font-normal opacity-70">· {new Date(j.created_at).toLocaleDateString("vi-VN")}</span>
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
                    className="rounded-lg bg-[#1fa4b8] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
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
                  className="rounded-lg bg-[#1fa4b8] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
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
          </>)}
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto overflow-x-hidden p-3">
          {selected ? (<>
            <StyleBar cv={shown} set={set} canFormat={canFormat} onFormat={(f) => previewRef.current?.format(f)} />
            <Preview ref={previewRef} cv={shown} set={set} editable onSelectionChange={setCanFormat} />
          </>) : <Preview cv={shown} />}
        </div>
      </div>
    </div>
  );
}
