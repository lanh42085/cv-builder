"use client";

import { BoldTextarea } from "./BoldTextarea";

export const INPUT = "w-full rounded-lg border-0 bg-[#eff2f9] px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-[#e6ebf7] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

/** Ô nhập dùng chung: nhãn · gợi ý (cột "Gợi ý" của sheet) · ví dụ mờ. */
export function Field({ label, hint, value, onChange, placeholder, multiline, compact, type = "text" }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; compact?: boolean; type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm text-neutral-500">{label}{hint && <span className="text-neutral-400"> · {hint}</span>}</div>
      {multiline ? (
        <BoldTextarea className={INPUT} value={value} placeholder={placeholder} onValueChange={onChange} compact={compact} />
      ) : (
        <input className={INPUT} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function ItemCard({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold text-neutral-800">{title}</div>
        <button type="button" onClick={onRemove} className="text-xs text-neutral-400 hover:text-red-600">Xoá</button>
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mint)] text-base leading-none">+</span>{children}
    </button>
  );
}

/** Dòng gợi ý ngắn dưới tiêu đề mục. */
export function Intro({ children }: { children: React.ReactNode }) {
  return <p className="-mt-2 mb-2 text-sm text-neutral-500">{children}</p>;
}
