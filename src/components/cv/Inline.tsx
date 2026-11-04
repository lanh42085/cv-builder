import { parseInline } from "@/lib/cv/inline";

/** Hiện chuỗi có **đậm** thành React. */
export function Inline({ text, src }: { text: string; src?: string | null }) {
  const runs = parseInline(text);
  const inner = runs.map((r, i) => (r.bold ? <b key={i}>{r.text}</b> : <span key={i}>{r.text}</span>));
  return src ? <span data-src={src}>{inner}</span> : <>{inner}</>;
}
