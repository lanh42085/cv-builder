import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { normalizeCv } from "@/lib/cv/schema";
import { Brand } from "@/components/Brand";
import { AdminCvView, type JobRow } from "./view";

export const dynamic = "force-dynamic";

export default async function AdminCvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isAdmin())) redirect("/");

  const { data: resume } = await supabase.from("resumes").select("id, title, data, user_id, updated_at").eq("id", id).single();
  if (!resume) notFound();
  const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", resume.user_id).maybeSingle();
  const { data: jobs } = await supabase.from("job_versions").select("id, job_title, tailored, style, cv_override, created_at").eq("resume_id", id).order("created_at", { ascending: false });

  return (
    <div className="flex h-screen flex-col bg-[#e6f4f1]">
      <header className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <Brand />
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-900">← Quản lý học viên</Link>
        </div>
        <div className="text-sm text-neutral-600">{profile?.full_name ? `${profile.full_name} · ` : ""}{profile?.email} · sửa cuối {new Date(resume.updated_at).toLocaleDateString("vi-VN")}</div>
      </header>
      <AdminCvView resumeId={resume.id} cv={normalizeCv(resume.data)} jobs={(jobs ?? []) as JobRow[]} />
    </div>
  );
}
