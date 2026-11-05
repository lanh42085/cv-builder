import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-5-5";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Thiếu ANTHROPIC_API_KEY trong Environment Variables.");
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/** Khối system được đánh dấu cache: phần hướng dẫn cố định chỉ tính 10% giá ở các lần gọi sau (trong 5 phút). */
export function cachedSystem(text: string) {
  return [{ type: "text" as const, text, cache_control: { type: "ephemeral" as const } }];
}

/** Gọi Claude một lượt, trả về text thuần. Truyền { system, user } để phần system được cache. */
export async function ask(prompt: string | { system: string; user: string }, maxTokens = 1024): Promise<string> {
  const res = await anthropic().messages.create(
    typeof prompt === "string"
      ? { model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }
      : { model: MODEL, max_tokens: maxTokens, system: cachedSystem(prompt.system), messages: [{ role: "user", content: prompt.user }] },
  );
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");
  const u = res.usage as { cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  console.log(`[ask] stop=${res.stop_reason} in=${res.usage.input_tokens} cacheRead=${u.cache_read_input_tokens ?? 0} cacheWrite=${u.cache_creation_input_tokens ?? 0} out=${res.usage.output_tokens} chars=${text.length} head=${JSON.stringify(text.slice(0, 80))}`);
  return text;
}
