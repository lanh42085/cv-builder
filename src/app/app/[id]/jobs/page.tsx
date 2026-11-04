import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeCv } from "@/lib/cv/schema";
import { JobsClient } from "./jobs-client";

export default async function JobsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: resume } = await supabase.from("resumes").select("id, title, data").eq("id", id).single();
  if (!resume) notFound();
  const { data: jobs } = await supabase.from("job_versions")
    .select("id, job_title, jd_text, keyword_output, tailored, created_at")
    .eq("resume_id", id).order("created_at", { ascending: false });
  return <JobsClient resumeId={resume.id} title={resume.title} cv={normalizeCv(resume.data)} initialJobs={jobs ?? []} />;
}
