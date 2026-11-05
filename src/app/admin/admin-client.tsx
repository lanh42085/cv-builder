"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addAllowed, removeAllowed, setRole, type Role } from "./actions";

export type Row = { email: string; note: string | null; role: Role; created_at: string; full_name: string | null; last_sign_in_at: string | null };
const OWNER = "lananh.laxi@gmail.com";
const EMAIL_RE = /[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+/g;
const INPUT = "rounded-lg border-0 bg-[#eef6f4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

export function AddPanel() {
  const [text, setText] = useState("");
  const [role, setRoleSel] = useState<Role>("student");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const count = new Set(text.match(EMAIL_RE)?.map((e) => e.toLowerCase())).size;

  async function importFile(file: File) {
    setMsg(null);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const found = new Set<string>();
      for (const name of wb.SheetNames) {
        const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: false, defval: "" });
        for (const row of rows) for (const cell of row) for (const e of String(cell ?? "").match(EMAIL_RE) ?? []) found.add(e.toLowerCase());
      }
      const have = new Set(text.match(EMAIL_RE)?.map((e) => e.toLowerCase()));
      const add = [...found].filter((e) => !have.has(e));
      if (add.length) setText((t) => (t.trim() ? t.trimEnd() + "\n" : "") + add.join("\n"));
      setMsg(`File có ${found.size} email, đưa vào ô ${add.length}.`);
    } catch (e) { setMsg("Không đọc được file: " + (e instanceof Error ? e.message : String(e))); }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function add() {
    setBusy(true); setMsg(null);
    const r = await addAllowed(text, role);
    if (!r.ok) setMsg("Lỗi: " + r.error);
    else {
      setMsg(`Đã thêm ${r.added} ${role === "admin" ? "admin" : "học viên"}` + (r.skipped ? `, ${r.skipped} email đã có sẵn` : "") + (r.bad?.length ? `, bỏ qua ${r.bad.length} dòng không phải email` : "") + ".");
      setText(""); router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} spellCheck={false}
        placeholder={"an.nguyen@gmail.com\nbinh.tran@gmail.com"}
        className="w-full rounded-lg border-0 bg-[#eef6f4] px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border px-4 py-2.5 text-sm hover:bg-neutral-50">Nhập từ Excel / CSV</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
        <span className="text-sm text-neutral-500">{count} email</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t pt-3">
        <label className="text-sm text-neutral-600">Quyền:</label>
        <select value={role} onChange={(e) => setRoleSel(e.target.value as Role)} className={INPUT}>
          <option value="student">Học viên</option>
          <option value="admin">Admin</option>
        </select>
        <button type="button" onClick={add} disabled={busy || count === 0}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{busy ? "Đang thêm…" : `Thêm ${count || ""}`}</button>
      </div>
      {msg && <p className="text-sm text-neutral-700">{msg}</p>}
    </div>
  );
}

export function ListPanel({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const shown = rows.filter((r) => !q || r.email.includes(q.toLowerCase()) || (r.full_name ?? "").toLowerCase().includes(q.toLowerCase()));

  async function changeRole(email: string, role: Role) {
    const r = await setRole(email, role); setMsg(r.ok ? null : "Lỗi: " + r.error); router.refresh();
  }
  async function remove(email: string) {
    if (!confirm(`Gỡ quyền của ${email}?`)) return;
    const r = await removeAllowed(email); setMsg(r.ok ? null : "Lỗi: " + r.error); router.refresh();
  }

  return (
    <div className="grid gap-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm email hoặc tên…" className={INPUT + " w-full"} />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white text-left text-xs text-neutral-400">
            <tr><th className="py-1">Email</th><th>Tên</th><th>Đăng nhập cuối</th><th>Quyền</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const owner = r.email === OWNER;
              return (
                <tr key={r.email} className="border-t">
                  <td className="py-1.5 pr-2">{r.email}</td>
                  <td className="pr-2 text-neutral-600">{r.full_name ?? ""}</td>
                  <td className="pr-2 text-neutral-500">{r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleDateString("vi-VN") : <span className="text-neutral-300">chưa vào</span>}</td>
                  <td className="pr-2">
                    <select value={r.role} disabled={owner} onChange={(e) => changeRole(r.email, e.target.value as Role)} className={INPUT + " py-1"}>
                      <option value="student">Học viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="text-right">{!owner && <button type="button" onClick={() => remove(r.email)} className="text-xs text-neutral-400 hover:text-red-600">Gỡ</button>}</td>
                </tr>
              );
            })}
            {!shown.length && <tr><td colSpan={5} className="py-6 text-center text-neutral-400">Chưa có ai.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
