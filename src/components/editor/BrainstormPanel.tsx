"use client";

import { useEffect, useRef, useState } from "react";
import type { ExperienceTask } from "@/lib/cv/schema";
import { RESULT_MARK, type BrainstormResult, type ChatMessage } from "@/lib/cv/brainstorm";

type Props = {
  resumeId: string;
  task: ExperienceTask;
  onFill: (r: BrainstormResult) => void;
  onClose: () => void;
};

type Row = { id: string; task_raw: string; messages: ChatMessage[]; result: BrainstormResult | null; status: "asking" | "done" };

export function BrainstormPanel({ resumeId, task, onFill, onClose }: Props) {
  const [row, setRow] = useState<Row | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [taskRaw, setTaskRaw] = useState(task.what || "");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Mở lại cuộc chat cũ của việc này nếu có
  useEffect(() => {
    fetch(`/api/brainstorm?resumeId=${resumeId}&itemId=${task.id}`)
      .then((r) => r.json()).then((j) => { if (j.brainstorm) setRow(j.brainstorm); })
      .finally(() => setLoaded(true));
  }, [resumeId, task.id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [row?.messages.length, streaming]);

  async function send(message?: string) {
    setError(null); setStreaming(true);
    const payload = row ? { brainstormId: row.id, message } : { resumeId, itemId: task.id, taskRaw };
    const res = await fetch("/api/brainstorm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok || !res.body) { setError(await res.text()); setStreaming(false); return; }
    const id = res.headers.get("x-brainstorm-id") ?? row?.id ?? "";
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { role: "user", content: message || "Hãy bắt đầu Bước 1.", at: now };
    let assistant = "";
    setRow((r) => ({ id, task_raw: r?.task_raw ?? taskRaw, status: "asking", result: null,
      messages: [...(r?.messages ?? []), userMsg, { role: "assistant", content: "", at: now }] }));

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistant += dec.decode(value, { stream: true });
      setRow((r) => r && ({ ...r, messages: r.messages.map((m, i) => (i === r.messages.length - 1 ? { ...m, content: assistant } : m)) }));
    }
    setStreaming(false);
    setInput("");
    // Lấy lại trạng thái cuối (đã có kết quả chưa)
    const j = await fetch(`/api/brainstorm?resumeId=${resumeId}&itemId=${task.id}`).then((r) => r.json());
    if (j.brainstorm) setRow(j.brainstorm);
  }

  const done = row?.status === "done" && row.result;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="font-medium">Làm rõ việc này với AI</div>
          <div className="text-xs text-neutral-500">AI hỏi → bạn trả lời → AI tổng hợp 6 mục STAR</div>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">Đóng ✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!loaded ? <p className="text-sm text-neutral-400">Đang mở…</p> : !row ? (
          <div className="grid gap-3">
            <label className="block">
              <div className="mb-1 text-sm font-medium">Việc bạn đã làm, viết thô bằng lời của bạn</div>
              <div className="mb-1 text-xs text-neutral-500">Ví dụ: Gộp dữ liệu kế toán của 5 công ty con bằng Power Query để làm báo cáo hằng ngày</div>
              <textarea rows={4} value={taskRaw} onChange={(e) => setTaskRaw(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none" />
            </label>
            <button type="button" disabled={!taskRaw.trim() || streaming} onClick={() => send()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50">
              {streaming ? "AI đang hỏi…" : "Bắt đầu — để AI hỏi tôi"}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="rounded-md bg-neutral-100 p-3 text-sm"><b>Task:</b> {row.task_raw}</div>
            {row.messages.map((m, i) => (
              <div key={i} className={"whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " + (m.role === "user" ? "ml-8 bg-blue-50" : "mr-8 bg-neutral-50 border")}>
                {m.role === "assistant" ? m.content.replace(RESULT_MARK, "").trim() || (streaming ? "…" : "") : m.content}
              </div>
            ))}
            {done && (
              <div className="rounded-lg border-2 border-green-300 bg-green-50 p-3">
                <div className="mb-2 text-sm font-medium text-green-900">AI đã tổng hợp xong 6 mục. Điền vào bảng rồi sửa tiếp nếu cần.</div>
                <button type="button" onClick={() => { onFill(row.result!); onClose(); }}
                  className="rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:opacity-90">Điền vào bảng</button>
              </div>
            )}
            <div ref={bottom} />
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {row && !done && (
        <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim() && !streaming) send(input.trim()); }}>
          <textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Trả lời AI… (không có số liệu thì nói “không có số, tổng hợp luôn”)"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !streaming) send(input.trim()); } }}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none" />
          <button type="submit" disabled={streaming || !input.trim()} className="rounded-md bg-[var(--accent)] px-4 text-sm text-white disabled:opacity-50">Gửi</button>
        </form>
      )}
      {row && (
        <div className="border-t px-3 py-2 text-right">
          <button type="button" className="text-xs text-neutral-500 hover:text-red-600"
            onClick={() => { if (confirm("Bắt đầu lại cuộc chat cho việc này?")) { setRow(null); setTaskRaw(row.task_raw); } }}>Bắt đầu lại</button>
        </div>
      )}
    </div>
  );
}
