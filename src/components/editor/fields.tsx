"use client";

import { BoldTextarea } from "./BoldTextarea";

/** Ô nhập dùng chung: nhãn · gợi ý (cột "Gợi ý" của sheet) · ví dụ mờ. */
export function Field({ label, hint, value, onChange, placeholder, multiline, type = "text" }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; type?: string;
}) {
  const cls = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none";
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      {hint && <div className="mb-1 text-xs text-neutral-500">{hint}</div>}
      {multiline ? (
        <BoldTextarea className={cls + ""} rows={4} value={value} placeholder={placeholder} onValueChange={onChange} />
      ) : (
        <input className={cls} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function ItemCard({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-neutral-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">Xoá</button>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-md border border-dashed border-neutral-400 px-3 py-2 text-sm text-neutral-700 hover:border-[var(--accent)] hover:text-[var(--accent)]">
      {children}
    </button>
  );
}

export function Intro({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">{children}</p>;
}
