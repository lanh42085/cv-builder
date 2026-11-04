import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold" style={{ color: "var(--accent)" }}>
        CV Builder cho Data Analyst
      </h1>
      <p className="text-neutral-600">
        Điền dữ liệu thô theo khung hướng dẫn, AI viết thành CV, tùy biến theo từng JD, xuất PDF.
      </p>
      <Link href="/login" className="mt-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-white hover:opacity-90">
        Bắt đầu — đăng nhập Google
      </Link>
      <p className="text-sm text-neutral-400">Bước 6 / 8 — chat làm rõ task</p>
    </main>
  );
}
