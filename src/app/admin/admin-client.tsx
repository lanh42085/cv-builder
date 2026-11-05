"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAllowed } from "./actions";

export function AdminClient({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;
  const fileRef = useRef<HTMLInputElement>(null);

  /** Đọc Excel/CSV, quét mọi ô có dạng email, gộp vào ô danh sách (bỏ trùng). */
  async function importFile(file: File) {
    setMsg(null);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const found = new Set<string>();
      for (const name of wb.SheetNames) {
        const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: false, defval: "" });
        for (const row of rows) for (const cell of row) {
          const m = String(cell ?? "").match(/[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+/g);
          for (const e of m ?? []) found.add(e.toLowerCase());
        }
      }
      const have = new Set(text.split(/\r?\n/).map((l) => l.trim().split(/\s/)[0].toLowerCase()).filter(Boolean));
      const add = [...found].filter((e) => !have.has(e));
      if (add.length) setText((t) => (t.trim() ? t.trimEnd() + "\n" : "") + add.join("\n"));
      setMsg(`File có ${found.size} email, thêm mới ${add.length}. Kiểm tra rồi bấm Lưu danh sách.`);
    } catch (e) {
      setMsg("Không đọc được file: " + (e instanceof Error ? e.message : String(e)));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    setBusy(true); setMsg(null);
    const r = await saveAllowed(text);
    if (!r.ok) setMsg("Lỗi: " + r.error);
    else setMsg(`Đã lưu ${r.count} email.` + (r.bad?.length ? ` Bỏ qua ${r.bad.length} dòng không phải email: ${r.bad.join(", ")}` : ""));
    setBusy(false); router.refresh();
  }

  return (
    <div className="grid gap-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} spellCheck={false}
        placeholder={"an.nguyen@gmail.com – DA12\nbinh.tran@gmail.com"}
        className="w-full rounded-lg border-0 bg-[#eef6f4] px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu danh sách"}</button>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="rounded-lg border px-4 py-2.5 text-sm hover:bg-neutral-50">Nhập từ Excel / CSV</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
        <span className="text-sm text-neutral-500">{lines} dòng</span>
      </div>
      {msg && <p className="text-sm text-neutral-700">{msg}</p>}
    </div>
  );
}
