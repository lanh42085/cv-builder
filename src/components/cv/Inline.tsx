import { parseInline } from "@/lib/cv/inline";

/** Hiện chuỗi có **đậm** / __nghiêng__ thành React. */
export function Inline({ text, src }: { text: string; src?: string | null }) {
  const inner = parseInline(text).map((r, i) => (
    <span key={i} style={{ fontWeight: r.bold ? 700 : undefined, fontStyle: r.italic ? "italic" : undefined }}>{r.text}</span>
  ));
  return src ? <span data-src={src}>{inner}</span> : <>{inner}</>;
}
