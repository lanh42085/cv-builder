import type { ExperienceTask } from "./schema";

export const RESULT_MARK = "===KẾT QUẢ===";
export const MAX_TURNS = 12;

export type ChatMessage = { role: "user" | "assistant"; content: string; at: string };
export type BrainstormResult = Omit<ExperienceTask, "id">;

const KEYS: { key: keyof BrainstormResult; re: RegExp }[] = [
  { key: "problem", re: /^-?\s*problem\b/i },
  { key: "what", re: /^-?\s*what\b/i },
  { key: "forWho", re: /^-?\s*for\s*who\b/i },
  { key: "how", re: /^-?\s*how\b/i },
  { key: "outcome", re: /^-?\s*outcome\b/i },
  { key: "impact", re: /^-?\s*impact\b/i },
];

/** Tách 6 mục sau dấu ===KẾT QUẢ===. Trả null nếu chưa thấy đủ. */
export function parseResult(text: string): BrainstormResult | null {
  const i = text.indexOf(RESULT_MARK);
  if (i < 0) return null;
  const body = text.slice(i + RESULT_MARK.length);
  const out: BrainstormResult = { problem: "", what: "", forWho: "", how: "", outcome: "", impact: "" };
  let cur: keyof BrainstormResult | null = null;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const hit = KEYS.find((k) => k.re.test(line));
    if (hit) {
      cur = hit.key;
      const idx = line.indexOf(":");
      out[cur] = idx >= 0 ? line.slice(idx + 1).trim() : "";
    } else if (cur) {
      out[cur] = (out[cur] + " " + line).trim();
    }
  }
  const filled = Object.values(out).filter(Boolean).length;
  return filled >= 4 ? out : null;
}
