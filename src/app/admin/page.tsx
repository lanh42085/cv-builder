import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { Brand } from "@/components/Brand";
import { AdminClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/");

  const { data: allowed } = await supabase.from("allowed_emails").select("email, note").order("created_at");
  const { data: users } = await supabase.rpc("admin_users");
  const allowedSet = new Set((allowed ?? []).map((a) => a.email));

  return (
    <div className="min-h-screen bg-[#e6f4f1]">
      <header className="flex items-center justify-between border-b bg-white px-4 py-2">
        <Brand />
        <Link href="/app" className="text-sm text-neutral-500 hover:text-neutral-900">← Về CV của tôi</Link>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900">Học viên được phép đăng nhập</h1>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Mỗi dòng một email Google. Có thể ghi chú sau dấu “ – ”, ví dụ: <code>an@gmail.com – DA12</code>. Bấm Lưu là áp dụng ngay; email bị xóa sẽ bị đăng xuất ở lần vào sau.</p>
          <AdminClient initial={(allowed ?? []).map((a) => a.note ? `${a.email} – ${a.note}` : a.email).join("\n")} />
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900">Đã đăng nhập ({users?.length ?? 0})</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-500">Tài khoản đã từng vào web. Dấu ✓ = đang trong danh sách cho phép.</p>
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-neutral-400"><tr><th className="py-1">Email</th><th>Tên</th><th>Lần cuối</th><th></th></tr></thead>
              <tbody>
                {(users ?? []).map((u: { email: string; full_name: string | null; last_sign_in_at: string | null }) => (
                  <tr key={u.email} className="border-t">
                    <td className="py-1.5">{u.email}</td>
                    <td className="text-neutral-600">{u.full_name ?? ""}</td>
                    <td className="text-neutral-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("vi-VN") : ""}</td>
                    <td className="text-right">{allowedSet.has(u.email) ? <span className="text-[var(--accent)]">✓</span> : <span className="text-red-500">chặn</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
