"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAllowed } from "./actions";

export function AdminClient({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;

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
        <span className="text-sm text-neutral-500">{lines} dòng</span>
      </div>
      {msg && <p className="text-sm text-neutral-700">{msg}</p>}
    </div>
  );
}
