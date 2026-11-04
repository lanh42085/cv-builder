import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { loadPrompt } from "@/lib/prompts";
import { MAX_TURNS, parseResult, type ChatMessage } from "@/lib/cv/brainstorm";

export const runtime = "nodejs";
export const maxDuration = 60;

/** GET ?resumeId&itemId → cuộc chat gần nhất của việc đó (nếu có). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const resumeId = u.searchParams.get("resumeId") ?? "";
  const itemId = u.searchParams.get("itemId") ?? "";
  const supabase = await createClient();
  const { data } = await supabase.from("brainstorms")
    .select("id, task_raw, messages, result, status")
    .eq("resume_id", resumeId).eq("item_id", itemId)
    .order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json({ brainstorm: data ?? null });
}

/** POST: tạo mới (taskRaw) hoặc gửi tin nhắn tiếp (brainstormId + message). Trả về stream text. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Chưa đăng nhập", { status: 401 });

  const body = (await req.json()) as { resumeId?: string; itemId?: string; taskRaw?: string; brainstormId?: string; message?: string };
  let id = body.brainstormId ?? "";
  let taskRaw = (body.taskRaw ?? "").trim();
  let messages: ChatMessage[] = [];

  if (id) {
    const { data } = await supabase.from("brainstorms").select("task_raw, messages, status").eq("id", id).single();
    if (!data) return new NextResponse("Không tìm thấy cuộc chat", { status: 404 });
    if (data.status === "done") return new NextResponse("Cuộc chat này đã có kết quả. Bấm “Bắt đầu lại” nếu muốn làm lại.", { status: 400 });
    taskRaw = data.task_raw;
    messages = (data.messages as ChatMessage[]) ?? [];
  } else {
    if (!body.resumeId || !body.itemId || !taskRaw) return new NextResponse("Thiếu dữ liệu", { status: 400 });
    const { data, error } = await supabase.from("brainstorms")
      .insert({ resume_id: body.resumeId, user_id: user.id, item_id: body.itemId, task_raw: taskRaw, messages: [] })
      .select("id").single();
    if (error || !data) return new NextResponse(error?.message ?? "Không tạo được", { status: 500 });
    id = data.id;
  }

  const userTurns = messages.filter((m) => m.role === "user").length;
  if (userTurns >= MAX_TURNS) return new NextResponse(`Đã đủ ${MAX_TURNS} lượt. Hãy gửi số liệu bạn có để AI tổng hợp, hoặc bắt đầu lại.`, { status: 400 });

  const userText = (body.message ?? "").trim() || "Hãy bắt đầu Bước 1.";
  messages = [...messages, { role: "user", content: userText, at: new Date().toISOString() }];
  await supabase.from("brainstorms").update({ messages }).eq("id", id);

  const system = await loadPrompt("brainstorm", taskRaw);
  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const s = anthropic().messages.stream({
          model: MODEL, max_tokens: 4000, system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            full += ev.delta.text;
            controller.enqueue(encoder.encode(ev.delta.text));
          }
        }
        const result = parseResult(full);
        const next = [...messages, { role: "assistant" as const, content: full, at: new Date().toISOString() }];
        await supabase.from("brainstorms")
          .update({ messages: next, ...(result ? { result, status: "done" } : {}) })
          .eq("id", id);
      } catch (err) {
        controller.enqueue(encoder.encode(`\n[Lỗi: ${err instanceof Error ? err.message : String(err)}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-brainstorm-id": id, "cache-control": "no-store" },
  });
}
