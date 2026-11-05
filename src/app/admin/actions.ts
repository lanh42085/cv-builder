"use server";

import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/admin";

const norm = (s: string) => s.trim().toLowerCase();
const valid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Thay toàn bộ danh sách bằng nội dung ô nhập (mỗi dòng 1 email, có thể kèm " – ghi chú"). */
export async function saveAllowed(text: string): Promise<{ ok: boolean; error?: string; count?: number; bad?: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { ok: false, error: "Không có quyền" };

  const rows = new Map<string, string | null>();
  const bad: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim(); if (!line) continue;
    const [e, ...rest] = line.split(/\s+[-–|]\s+|\t|,/);
    const email = norm(e);
    if (!valid(email)) { bad.push(line); continue; }
    rows.set(email, rest.join(" ").trim() || null);
  }
  rows.set(ADMIN_EMAIL, "admin");

  const { data: cur } = await supabase.from("allowed_emails").select("email");
  const remove = (cur ?? []).map((r) => r.email).filter((e) => !rows.has(e));
  if (remove.length) {
    const { error } = await supabase.from("allowed_emails").delete().in("email", remove);
    if (error) return { ok: false, error: error.message };
  }
  const { error } = await supabase.from("allowed_emails").upsert([...rows].map(([email, note]) => ({ email, note })));
  if (error) return { ok: false, error: error.message };
  return { ok: true, count: rows.size, bad };
}
