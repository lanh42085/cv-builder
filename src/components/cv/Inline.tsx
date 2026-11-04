import { parseInline } from "@/lib/cv/inline";

/** Hiện chuỗi có **đậm** thành React. */
export function Inline({ text }: { text: string }) {
  const runs = parseInline(text);
  return <>{runs.map((r, i) => (r.bold ? <b key={i}>{r.text}</b> : <span key={i}>{r.text}</span>))}</>;
}
