import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emptyCv } from "@/lib/cv/schema";

/** Mỗi tài khoản một CV: vào /app là mở thẳng CV đó, chưa có thì tạo. */
export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase.from("resumes").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (existing) redirect(`/app/${existing.id}`);

  const { data: created, error } = await supabase.from("resumes")
    .insert({ user_id: user.id, title: "CV của tôi", data: emptyCv() }).select("id").single();
  if (error || !created) throw new Error(error?.message ?? "Không tạo được CV");
  redirect(`/app/${created.id}`);
}
