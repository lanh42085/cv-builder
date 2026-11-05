"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { Preview, type PreviewHandle } from "@/components/cv/Preview";
import { StyleBar } from "@/components/cv/StyleBar";
import Image from "next/image";
import { saveResume } from "@/app/app/[id]/actions";
import { STEPS, StepAbout, StepAchievements, StepBasics, StepEducation, StepExperience, StepProjects, StepSkills } from "./steps";

type SaveState = "saved" | "dirty" | "saving" | "error";

export function Editor({ id, initialTitle, initialCv }: { id: string; initialTitle: string; initialCv: CvData }) {
  const [cv, setCv] = useState<CvData>(initialCv);
  const [title, setTitle] = useState(initialTitle);
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<SaveState>("saved");
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const previewRef = useRef<PreviewHandle>(null);
  const [canFormat, setCanFormat] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ cv, title });
  latest.current = { cv, title };

  const flush = useCallback(async () => {
    setSave("saving");
    const res = await saveResume(id, latest.current.title, latest.current.cv);
    setSave(res.ok ? "saved" : "error");
    if (res.ok) setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
  }, [id]);

  const schedule = useCallback(() => {
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1500);
  }, [flush]);

  const set = useCallback((fn: (c: CvData) => CvData) => {
    setCv((c) => fn(c));
    schedule();
  }, [schedule]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /** Lưu bản mới nhất rồi mới tải, để file không thiếu chữ vừa gõ. */
  async function download(kind: "pdf" | "docx") {
    setExporting(kind);
    if (timer.current) clearTimeout(timer.current);
    await flush();
    const res = await fetch(`/api/export/${kind}?id=${id}`);
    if (!res.ok) { alert(await res.text()); setExporting(null); return; }
    const blob = await res.blob();
    const name = res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ?? `CV.${kind}`;
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
  }

  const StepView = [StepBasics, StepAbout, StepExperience, StepProjects, StepSkills, StepEducation, StepAchievements][step];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/app" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"><Image src="/logo.png" alt="UniGap" width={24} height={26} /> ← CV của tôi</Link>
          <input value={title} onChange={(e) => { setTitle(e.target.value); schedule(); }}
            className="rounded px-2 py-1 text-sm font-medium hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <span className={"text-xs " + (save === "error" ? "text-red-600" : "text-neutral-500")}>
            {{ saved: savedAt ? `Đã lưu lúc ${savedAt}` : "Đã lưu", dirty: "Chưa lưu", saving: "Đang lưu…", error: "Lưu lỗi — bấm Lưu để thử lại" }[save]}
          </span>
          <button type="button" onClick={() => { if (timer.current) clearTimeout(timer.current); flush(); }}
            disabled={save === "saving"}
            className={"rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 " + (save === "dirty" || save === "error" ? "border-[var(--accent)] text-[var(--accent)] hover:bg-blue-50" : "hover:bg-neutral-100")}>
            Lưu
          </button>
          <button type="button" onClick={() => download("pdf")} disabled={exporting !== null}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50">
            {exporting === "pdf" ? "Đang tạo PDF…" : "Tải PDF"}
          </button>
          <button type="button" onClick={() => download("docx")} disabled={exporting !== null}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50">
            {exporting === "docx" ? "Đang tạo…" : "Tải DOCX"}
          </button>
          <Link href={`/app/${id}/jobs`} onClick={() => { if (timer.current) { clearTimeout(timer.current); flush(); } }}
            className="rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-blue-50">
            Tùy biến theo JD →
          </Link>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border-r bg-neutral-50">
          <nav className="flex flex-wrap gap-1 border-b bg-white px-4 py-2">
            {STEPS.map((s, i) => (
              <button key={s} type="button" onClick={() => setStep(i)}
                className={"rounded-full px-3 py-1 text-xs " + (i === step ? "bg-[var(--accent)] text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")}>
                {i + 1}. {s}
              </button>
            ))}
          </nav>
          <div className="p-4">
            <h2 className="mb-3 text-lg font-semibold">{step + 1}. {STEPS[step]}</h2>
            <StepView cv={cv} set={set} resumeId={id} />
            <div className="mt-6 flex justify-between">
              <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-40">← Trước</button>
              <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}
                className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-40">Tiếp →</button>
            </div>
          </div>
        </div>
        <div className="sticky top-0 self-start p-4">
          <StyleBar cv={cv} set={set} canFormat={canFormat} onFormat={(f) => previewRef.current?.format(f)} />
          <Preview ref={previewRef} cv={cv} set={set} onSelectionChange={setCanFormat} />
        </div>
      </div>
    </div>
  );
}
