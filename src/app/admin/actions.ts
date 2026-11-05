"use server";

import { createClient } from "@/lib/supabase/server";
import { OWNER_EMAIL, isAdmin } from "@/lib/admin";

export type Role = "student" | "admin";
const norm = (s: string) => s.trim().toLowerCase();
const valid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Thêm một đợt email với quyền đã chọn. Email đã có thì bỏ qua (không đổi quyền). */
export async function addAllowed(text: string, role: Role): Promise<{ ok: boolean; error?: string; added?: number; skipped?: number; bad?: string[] }> {
  if (!(await isAdmin())) return { ok: false, error: "Không có quyền" };
  const supabase = await createClient();
  const emails = new Set<string>(); const bad: string[] = [];
  for (const raw of text.split(/[\r\n,;]+/)) {
    const line = raw.trim(); if (!line) continue;
    const email = norm(line.split(/\s+[-–|]\s+|\t/)[0]);
    if (!valid(email)) { bad.push(line); continue; }
    emails.add(email);
  }
  if (!emails.size) return { ok: true, added: 0, skipped: 0, bad };
  const { data: cur } = await supabase.from("allowed_emails").select("email").in("email", [...emails]);
  const have = new Set((cur ?? []).map((r) => r.email));
  const rows = [...emails].filter((e) => !have.has(e)).map((email) => ({ email, role }));
  if (rows.length) {
    const { error } = await supabase.from("allowed_emails").insert(rows);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true, added: rows.length, skipped: have.size, bad };
}

export async function setRole(email: string, role: Role): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Không có quyền" };
  if (norm(email) === OWNER_EMAIL) return { ok: false, error: "Email gốc luôn là admin" };
  const supabase = await createClient();
  const { error } = await supabase.from("allowed_emails").update({ role }).eq("email", norm(email));
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removeAllowed(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Không có quyền" };
  if (norm(email) === OWNER_EMAIL) return { ok: false, error: "Không gỡ được email gốc" };
  const supabase = await createClient();
  const { error } = await supabase.from("allowed_emails").delete().eq("email", norm(email));
  return error ? { ok: false, error: error.message } : { ok: true };
}
