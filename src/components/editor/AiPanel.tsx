"use client";

import { useState } from "react";
import type { CvData, GeneratedSection } from "@/lib/cv/schema";
import { BoldTextarea } from "./BoldTextarea";

type Props = { cv: CvData; set: (fn: (cv: CvData) => CvData) => void };

async function callGenerate(section: string, cv: CvData) {
  const res = await fetch(`/api/generate/${section}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cv }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Lỗi không rõ");
  return json;
}

function GenerateButton({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
      {loading ? "AI đang viết… (10–20 giây)" : label}
    </button>
  );
}

function Notes({ text }: { text: string }) {
  if (!text) return null;
  return (
    <details className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
      <summary className="cursor-pointer font-medium text-amber-900">Ghi chú & câu hỏi bổ sung từ AI</summary>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-amber-900">{text}</pre>
    </details>
  );
}

/* ---------- About Me ---------- */
export function AiAbout({ cv, set }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const g = cv.generated.aboutMe;

  async function run() {
    setLoading(true); setError(null);
    try {
      const { options } = await callGenerate("about", cv);
      set((c) => ({ ...c, generated: { ...c.generated, aboutMe: { options, chosen: 0, final: options[0] ?? "" } } }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    setLoading(false);
  }

  return (
    <div className="mt-4 grid gap-3 rounded-lg border-2 border-[var(--accent)]/30 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Tạo bằng AI</div>
        <GenerateButton loading={loading} onClick={run} label={g.options.length ? "Viết lại" : "Viết About Me"} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {g.options.length > 0 && (
        <>
          <div className="text-xs text-neutral-500">Chọn 1 trong 3 phương án, rồi sửa tay ở ô dưới nếu muốn.</div>
          {g.options.map((o, i) => (
            <label key={i} className={"flex cursor-pointer gap-2 rounded-md border p-2 text-sm " + (g.chosen === i ? "border-[var(--accent)] bg-blue-50" : "")}>
              <input type="radio" name="about-opt" checked={g.chosen === i}
                onChange={() => set((c) => ({ ...c, generated: { ...c.generated, aboutMe: { ...c.generated.aboutMe, chosen: i, final: c.generated.aboutMe.options[i] } } }))} />
              <span>{o}</span>
            </label>
          ))}
          <label className="block">
            <div className="mb-1 text-sm font-medium">Bản dùng trong CV (sửa được)</div>
            <BoldTextarea rows={4} value={g.final}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-8 text-sm focus:border-[var(--accent)] focus:outline-none"
              onValueChange={(v) => set((c) => ({ ...c, generated: { ...c.generated, aboutMe: { ...c.generated.aboutMe, final: v } } }))} />
          </label>
        </>
      )}
    </div>
  );
}

/* ---------- Experience / Projects (chung một khối) ---------- */
function SectionsEditor({ sections, onChange }: { sections: GeneratedSection[]; onChange: (s: GeneratedSection[]) => void }) {
  const upd = (i: number, patch: Partial<GeneratedSection>) => onChange(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="grid gap-3">
      {sections.map((s, i) => (
        <div key={i} className="grid gap-2 rounded-md border bg-neutral-50 p-3">
          <input value={s.header} onChange={(e) => upd(i, { header: e.target.value })}
            className="rounded-md border border-neutral-300 px-2 py-1 text-sm font-medium focus:border-[var(--accent)] focus:outline-none" />
          <BoldTextarea rows={Math.max(3, s.bullets.length + 1)} value={s.bullets.join("\n")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-8 text-sm focus:border-[var(--accent)] focus:outline-none"
            onValueChange={(v) => upd(i, { bullets: v.split("\n") })} />
          <div className="text-xs text-neutral-400">Mỗi dòng = 1 bullet · bôi đen rồi bấm B để in đậm</div>
        </div>
      ))}
    </div>
  );
}

export function AiSection({ cv, set, kind }: Props & { kind: "experience" | "projects" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sections = cv.generated[kind];
  const label = kind === "experience" ? "Work Experience" : "Projects";

  async function run() {
    setLoading(true); setError(null);
    try {
      const { sections: s, notes } = await callGenerate(kind, cv);
      set((c) => ({ ...c, generated: { ...c.generated, [kind]: s, notes: mergeNotes(c.generated.notes, label, notes) } }));
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    setLoading(false);
  }

  return (
    <div className="mt-4 grid gap-3 rounded-lg border-2 border-[var(--accent)]/30 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Tạo bằng AI</div>
        <GenerateButton loading={loading} onClick={run} label={sections.length ? "Viết lại" : `Viết ${label}`} />
      </div>
      {sections.length > 0 && (
        <p className="text-xs text-neutral-500">Viết lại sẽ thay toàn bộ phần này bằng bản mới. Bản dưới sửa tay được, preview cập nhật ngay.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {sections.length > 0 && (
        <SectionsEditor sections={sections} onChange={(s) => set((c) => ({ ...c, generated: { ...c.generated, [kind]: s } }))} />
      )}
      <Notes text={extractNotes(cv.generated.notes, label)} />
    </div>
  );
}

/* notes lưu chung một chuỗi, mỗi phần có tiêu đề riêng */
function mergeNotes(all: string, label: string, notes: string): string {
  const others = all.split(/\n(?=### )/).filter((b) => b.trim() && !b.startsWith(`### ${label}`));
  return [...others, notes ? `### ${label}\n${notes}` : ""].filter(Boolean).join("\n");
}
function extractNotes(all: string, label: string): string {
  const block = all.split(/\n(?=### )/).find((b) => b.startsWith(`### ${label}`));
  return block ? block.replace(`### ${label}\n`, "") : "";
}
