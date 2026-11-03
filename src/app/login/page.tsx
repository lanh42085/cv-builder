import { GoogleButton } from "./google-button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
        CV Builder cho Data Analyst
      </h1>
      <p className="text-neutral-600">Đăng nhập bằng tài khoản Google để bắt đầu tạo CV.</p>
      <GoogleButton />
    </main>
  );
}
