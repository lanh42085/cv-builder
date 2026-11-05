"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { emptyCv } from "@/lib/cv/schema";

export async function createResume() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase.from("resumes").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= 1) { revalidatePath("/app"); return; } // mỗi tài khoản 1 CV gốc
  const { error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title: "CV của tôi", data: emptyCv() });
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function removeResume(id: string) {
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("resumes").delete().eq("id", id);
  revalidatePath("/app");
}
