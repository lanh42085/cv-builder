export default function TestPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
        Bước 2 — thử hai rủi ro lớn
      </h1>
      <a href="/api/test-pdf" target="_blank" className="rounded-lg border bg-white p-4 hover:border-neutral-400">
        <div className="font-medium">1. Xuất PDF trên Vercel</div>
        <div className="text-sm text-neutral-600">
          Mở ra một CV mẫu dạng PDF. Đạt khi: chữ tiếng Việt có dấu đúng, bôi đen copy được chữ.
        </div>
      </a>
      <a href="/api/test-ai" target="_blank" className="rounded-lg border bg-white p-4 hover:border-neutral-400">
        <div className="font-medium">2. Gọi Claude bằng prompt About Me</div>
        <div className="text-sm text-neutral-600">
          Gửi 3 dòng dữ liệu giả qua đúng prompt phần 2 trong sheet. Đạt khi: trả về 3 phương án tiếng Anh, plain text.
        </div>
      </a>
      <p className="text-xs text-neutral-400">Trang này sẽ bị gỡ khi sang bước 3.</p>
    </main>
  );
}
