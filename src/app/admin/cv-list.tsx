"use client";

import Link from "next/link";
import { useState } from "react";

export type CvRow = { id: string; email: string; name: string; headline: string; percent: number; updatedAt: string; jobs: number };

export function CvList({ rows }: { rows: CvRow[] }) {
  const [q, setQ] = useState("");
  const k = q.toLowerCase();
  const shown = rows.filter((r) => !k || r.email.includes(k) || r.name.toLowerCase().includes(k));
  return (
    <div className="grid gap-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm email hoặc tên…"
        className="w-full rounded-lg border-0 bg-[#eef6f4] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" />
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white text-left text-xs text-neutral-400">
            <tr><th className="py-1">Học viên</th><th>Tên trên CV</th><th>Vị trí</th><th>Hoàn thiện</th><th>Bản JD</th><th>Sửa cuối</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-1.5 pr-2">{r.email}</td>
                <td className="pr-2 font-medium">{r.name || <span className="text-neutral-300">(trống)</span>}</td>
                <td className="pr-2 text-neutral-600">{r.headline}</td>
                <td className="pr-2">
                  <span className={"rounded px-1.5 py-0.5 text-xs font-bold text-white " + (r.percent >= 70 ? "bg-[var(--accent)]" : r.percent >= 40 ? "bg-amber-500" : "bg-red-500")}>{r.percent}%</span>
                </td>
                <td className="pr-2 text-neutral-600">{r.jobs}</td>
                <td className="pr-2 text-neutral-500">{new Date(r.updatedAt).toLocaleDateString("vi-VN")}</td>
                <td className="whitespace-nowrap text-right">
                  <Link href={`/admin/cv/${r.id}`} className="mr-3 font-semibold text-[var(--accent)] hover:underline">Xem</Link>
                  <a href={`/api/export/pdf?id=${r.id}`} className="text-neutral-500 hover:text-neutral-900">Tải PDF</a>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={7} className="py-6 text-center text-neutral-400">Chưa có CV nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
