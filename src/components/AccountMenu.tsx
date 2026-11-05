"use client";

import Image from "next/image";

/** Avatar tròn góc phải; bấm mở menu: email + Đăng xuất. */
export function AccountMenu({ email, avatarUrl, name }: { email: string; avatarUrl?: string | null; name?: string | null }) {
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  return (
    <details className="relative">
      <summary className="list-none cursor-pointer">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name ?? email} width={36} height={36} className="h-9 w-9 rounded-full ring-2 ring-white shadow" unoptimized />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow" style={{ background: "var(--accent)" }}>{initial}</span>
        )}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border bg-white p-2 text-sm shadow-xl">
        <div className="px-3 py-2">
          {name && <div className="font-medium">{name}</div>}
          <div className="truncate text-xs text-neutral-500">{email}</div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-100">Đăng xuất</button>
        </form>
      </div>
    </details>
  );
}
