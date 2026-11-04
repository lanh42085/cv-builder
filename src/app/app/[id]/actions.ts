"use server";

import { createClient } from "@/lib/supabase/server";
import type { CvData } from "@/lib/cv/schema";

export async function saveResume(id: string, title: string, data: CvData): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("resumes")
    .update({ title: title.trim() || "CV của tôi", data })
    .eq("id", id); // RLS đảm bảo chỉ chủ sở hữu update được
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteResume(id: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  return { ok: !error };
}
