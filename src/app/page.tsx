import Link from "next/link";
import { Brand } from "@/components/Brand";
import { AccountMenu } from "@/components/AccountMenu";
import { SampleCv } from "@/components/cv/SampleCv";
import { getSessionUser } from "@/lib/supabase/user";

const STEPS = [
  { n: "1", title: "Điền dữ liệu thô", text: "7 phần theo đúng khung hướng dẫn của lớp: About Me, Experience (STAR), Projects, Skills… Chưa cần hay, chưa cần tiếng Anh." },
  { n: "2", title: "AI viết thành CV", text: "Bấm một nút, AI viết lại từng phần bằng tiếng Anh chuẩn Data Analyst — chỉ dựa trên những gì bạn đã làm, không bịa." },
  { n: "3", title: "Tùy biến & tải về", text: "Dán JD, AI lồng keyword rồi tạo bản riêng cho job đó. Tải PDF chuẩn ATS hoặc DOCX để nộp." },
];

export default async function Home() {
  const user = await getSessionUser();
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Brand />
        {user ? (
          <AccountMenu email={user.email} name={user.name} avatarUrl={user.avatarUrl} />
        ) : (
          <Link href="/login" className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-neutral-50" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            Đăng nhập
          </Link>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-tight lg:text-5xl" style={{ color: "var(--navy)" }}>
            CV Data Analyst chuẩn.<br />
            <span style={{ color: "var(--accent)" }}>Trong 30 phút.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-600">
            Điền dữ liệu thô theo khung hướng dẫn, AI viết thành CV Data Analyst chuẩn, tùy biến theo từng JD.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/app" className="rounded-full px-8 py-3 text-base font-semibold text-white shadow-lg hover:opacity-90" style={{ background: "var(--accent)" }}>
              {user ? "Mở CV của tôi" : "Tạo CV"}
            </Link>
            <span className="text-sm text-neutral-500">Dành cho học viên UniGap · miễn phí</span>
          </div>
          <ul className="mt-8 grid gap-2 text-sm text-neutral-700">
            <li>✓ Prompt viết CV do giảng viên UniGap thiết kế, đã dùng cho hàng trăm học viên</li>
            <li>✓ AI không thêm kinh nghiệm, tool hay số liệu bạn không có</li>
            <li>✓ PDF có text layer, qua được hệ thống lọc ATS</li>
          </ul>
        </div>
        <div className="hidden justify-center lg:flex">
          <SampleCv />
        </div>
      </section>

      <section style={{ background: "var(--mint)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold" style={{ color: "var(--navy)" }}>Ba bước, một CV</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: "var(--accent)" }}>{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold" style={{ color: "var(--navy)" }}>{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-neutral-500 md:flex-row">
        <Brand size={28} />
        <span>Công cụ nội bộ cho học viên chương trình Data Analyst — UniGap</span>
      </footer>
    </main>
  );
}
