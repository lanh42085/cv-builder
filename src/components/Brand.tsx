import Image from "next/image";
import Link from "next/link";

export function Brand({ href = "/", size = 36 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <Image src="/logo.png" alt="UniGap" width={size} height={Math.round(size * 1.1)} priority />
      <span className="font-semibold" style={{ color: "var(--navy)" }}>UniGap <span style={{ color: "var(--accent)" }}>CV Builder</span></span>
    </Link>
  );
}
