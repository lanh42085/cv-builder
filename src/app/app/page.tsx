import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createResume } from "./actions";
import { DeleteButton } from "./delete-button";
import { Brand } from "@/components/Brand";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Brand href="/app" size={32} />
          <span className="text-sm text-neutral-400">{user.email}</span>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-neutral-500 hover:text-neutral-900">Đăng xuất</button>
        </form>
      </header>

      {(!resumes || resumes.length === 0) ? (
        <form action={createResume} className="mb-6">
          <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white hover:opacity-90">
            + Tạo CV của tôi
          </button>
        </form>
      ) : (
        <p className="mb-4 text-sm text-neutral-500">
          Mỗi tài khoản có một CV gốc. Bản tùy biến theo từng job thì tạo bao nhiêu cũng được — mở CV rồi bấm “Tùy biến theo JD”.
        </p>
      )}

      {resumes && resumes.length > 0 ? (
        <ul className="divide-y rounded-lg border bg-white">
          {resumes.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/app/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">{new Date(r.updated_at).toLocaleString("vi-VN")}</span>
                <DeleteButton id={r.id} title={r.title} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500">Chưa có CV. Bấm “Tạo CV của tôi” để bắt đầu.</p>
      )}
    </main>
  );
}
