import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeCv } from "@/lib/cv/schema";
import { Editor } from "@/components/editor/Editor";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resume } = await supabase.from("resumes").select("id, title, data").eq("id", id).single();
  if (!resume) notFound();

  return <Editor id={resume.id} initialTitle={resume.title} initialCv={normalizeCv(resume.data)} />;
}
