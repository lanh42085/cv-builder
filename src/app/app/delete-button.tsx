"use client";

import { useTransition } from "react";
import { removeResume } from "./actions";

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending}
      onClick={() => { if (confirm(`Xoá "${title}"? Không khôi phục được.`)) start(() => removeResume(id)); }}
      className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50">
      {pending ? "Đang xoá…" : "Xoá"}
    </button>
  );
}
