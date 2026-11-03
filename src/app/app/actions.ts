"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createResume() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase.from("resumes").select("id", { count: "exact", head: true });
  const { error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title: `CV ${(count ?? 0) + 1}`, data: {} });
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}
