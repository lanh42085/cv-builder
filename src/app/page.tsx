export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold" style={{ color: "var(--accent)" }}>
        CV Builder cho Data Analyst
      </h1>
      <p className="text-neutral-600">
        Khung dự án đã chạy. Bước tiếp theo: đăng nhập, nhập liệu, AI viết CV, xuất PDF.
      </p>
      <p className="text-sm text-neutral-400">Bước 1 / 8 — khung + deploy</p>
    </main>
  );
}
