import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { Brand } from "@/components/Brand";
import { AddPanel, ListPanel, type Row } from "./admin-client";
import { CvList, type CvRow } from "./cv-list";
import { normalizeCv } from "@/lib/cv/schema";
import { cvScore } from "@/lib/cv/score";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await isAdmin())) redirect("/");
  const { data } = await supabase.rpc("admin_list");
  const rows = (data ?? []) as Row[];
  const { data: cvData } = await supabase.rpc("admin_resumes");
  const cvs: CvRow[] = ((cvData ?? []) as { id: string; email: string; full_name: string | null; title: string; data: unknown; updated_at: string; jobs: number }[]).map((r) => {
    const cv = normalizeCv(r.data);
    return { id: r.id, email: r.email, name: cv.basics.fullName || r.full_name || "", headline: cv.basics.headline, percent: cvScore(cv).percent, updatedAt: r.updated_at, jobs: Number(r.jobs) };
  });

  return (
    <div className="min-h-screen bg-[#e6f4f1]">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <Brand />
        <Link href="/app" className="text-sm text-neutral-500 hover:text-neutral-900">← Về CV của tôi</Link>
      </header>
      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[2fr_3fr]">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900">Thêm học viên mới</h1>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Dán email Google, mỗi dòng một email, hoặc nhập từ file Excel/CSV. Chọn quyền rồi bấm Thêm.</p>
          <AddPanel />
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900">Danh sách đã cấp quyền ({rows.length})</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Đổi quyền ngay tại dòng. Gỡ = thu quyền, người đó bị đăng xuất ở lần vào sau.</p>
          <ListPanel rows={rows} />
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-bold text-neutral-900">CV học viên ({cvs.length})</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Chỉ xem, không sửa được. Bấm Xem để mở CV và các bản theo JD.</p>
          <CvList rows={cvs} />
        </section>
      </main>
    </div>
  );
}
