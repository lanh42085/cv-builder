import Image from "next/image";
import Link from "next/link";
import { GoogleButton } from "./google-button";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <LoginInner searchParams={searchParams} />;
}

async function LoginInner({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--mint)" }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <Link href="/" className="inline-block"><Image src="/logo.png" alt="UniGap" width={72} height={80} priority /></Link>
        <h1 className="mt-4 text-xl font-bold" style={{ color: "var(--navy)" }}>UniGap <span style={{ color: "var(--accent)" }}>CV Builder</span></h1>
        <p className="mt-2 text-sm text-neutral-600">Đăng nhập bằng tài khoản Google để bắt đầu tạo CV.</p>
        <div className="mt-6"><GoogleButton /></div>
        {error === "denied" && <p className="mt-3 text-sm text-red-600">Tài khoản Google này chưa được cấp quyền. Liên hệ giảng viên UniGap để được thêm vào danh sách.</p>}
        {error && error !== "denied" && <p className="mt-3 text-sm text-red-600">Đăng nhập không thành công, thử lại.</p>}
        <p className="mt-6 text-xs text-neutral-400">Chỉ dành cho học viên UniGap. Dữ liệu CV của bạn chỉ mình bạn xem được.</p>
      </div>
    </main>
  );
}
