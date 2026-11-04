"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CvData } from "@/lib/cv/schema";
import { Preview } from "@/components/cv/Preview";
import { saveResume } from "@/app/app/[id]/actions";
import { STEPS, StepAbout, StepAchievements, StepBasics, StepEducation, StepExperience, StepProjects, StepSkills } from "./steps";

type SaveState = "saved" | "dirty" | "saving" | "error";

export function Editor({ id, initialTitle, initialCv }: { id: string; initialTitle: string; initialCv: CvData }) {
  const [cv, setCv] = useState<CvData>(initialCv);
  const [title, setTitle] = useState(initialTitle);
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<SaveState>("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ cv, title });
  latest.current = { cv, title };

  const flush = useCallback(async () => {
    setSave("saving");
    const res = await saveResume(id, latest.current.title, latest.current.cv);
    setSave(res.ok ? "saved" : "error");
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

  const StepView = [StepBasics, StepAbout, StepExperience, StepProjects, StepSkills, StepEducation, StepAchievements][step];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/app" className="text-sm text-neutral-500 hover:text-neutral-900">← CV của tôi</Link>
          <input value={title} onChange={(e) => { setTitle(e.target.value); schedule(); }}
            className="rounded px-2 py-1 text-sm font-medium hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none" />
        </div>
        <span className={"text-xs " + (save === "error" ? "text-red-600" : "text-neutral-500")}>
          {{ saved: "Đã lưu", dirty: "Đang gõ…", saving: "Đang lưu…", error: "Lưu lỗi — thử lại" }[save]}
        </span>
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
            <StepView cv={cv} set={set} />
            <div className="mt-6 flex justify-between">
              <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-40">← Trước</button>
              <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}
                className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white disabled:opacity-40">Tiếp →</button>
            </div>
          </div>
        </div>
        <div className="sticky top-0 self-start p-4">
          <Preview cv={cv} />
        </div>
      </div>
    </div>
  );
}
