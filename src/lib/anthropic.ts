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

/** Gọi Claude một lượt, trả về text thuần. */
export async function ask(prompt: string, maxTokens = 1024): Promise<string> {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n");
}
