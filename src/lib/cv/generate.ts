import type { CvData, GeneratedSection } from "./schema";
import { toPlainTable } from "./table";
import { fmtMonth } from "./view";

/** Dựng bảng dữ liệu plain text đúng tên cột của sheet để đưa vào prompt. */
export function aboutTable(cv: CvData): string {
  const a = cv.raw.aboutMe;
  return toPlainTable([
    { "Đầu mục": "1. Bạn là ai", "Bạn điền": a.whoAmI },
    { "Đầu mục": "2. Bạn mạnh gì", "Bạn điền": a.strengths },
    { "Đầu mục": "3. Bạn muốn gì", "Bạn điền": a.goal },
  ]);
}

export function experienceTable(cv: CvData): string {
  return toPlainTable(cv.raw.experience.flatMap((e) => e.tasks.map((t) => ({
    "Công ty": e.company,
    "Vị trí": e.role,
    "Thời gian": `${fmtMonth(e.startDate)} – ${e.current ? "Present" : fmtMonth(e.endDate)}`,
    "Problem – Vấn đề là gì?": t.problem,
    "What – Làm gì?": t.what,
    "For Who? Cho ai": t.forWho,
    "How - Làm như thế nào?": t.how,
    "Outcome - Mô tả thành phẩm": t.outcome,
    "Impact - Ảnh hưởng tích cực tạo ra?": t.impact,
  }))));
}

export function projectsTable(cv: CvData): string {
  return toPlainTable(cv.raw.projects.map((p) => ({
    "Tên project": p.name,
    "Tool": p.tools,
    "Link": p.link,
    "S – Situation": p.situation,
    "T – Task": p.task,
    "A – Action": p.action,
    "R – Result": p.result,
  })));
}

/* ---------- Parse output của Claude ---------- */

/** "1. ...\n\n2. ...\n\n3. ..." → 3 chuỗi */
export function parseOptions(text: string): string[] {
  const out: string[] = [];
  let cur: string[] | null = null;
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(\d+)[.)]\s*(.*)$/);
    if (m) { if (cur) out.push(cur.join(" ").trim()); cur = [m[2]]; }
    else if (cur && line.trim()) cur.push(line.trim());
  }
  if (cur) out.push(cur.join(" ").trim());
  return out.filter(Boolean).slice(0, 3);
}

/** Tách phần nội dung chính và phần GHI CHÚ / CÂU HỎI BỔ SUNG ở cuối. */
function splitNotes(text: string): { body: string; notes: string } {
  const idx = text.search(/^\s*(GHI CHÚ|CÂU HỎI BỔ SUNG)/im);
  if (idx < 0) return { body: text, notes: "" };
  return { body: text.slice(0, idx), notes: text.slice(idx).trim() };
}

/** Khối "Header | ...\n- bullet\n- bullet" lặp lại → mảng {header, bullets}. */
export function parseBlocks(body: string): { header: string; bullets: string[] }[] {
  const blocks: { header: string; bullets: string[] }[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[-•*]\s+/.test(line)) {
      if (blocks.length) blocks[blocks.length - 1].bullets.push(line.replace(/^[-•*]\s+/, ""));
    } else if (line.includes("|") || blocks.length === 0 || blocks[blocks.length - 1].bullets.length > 0) {
      blocks.push({ header: line, bullets: [] });
    } else {
      blocks[blocks.length - 1].header += " " + line;
    }
  }
  return blocks.filter((b) => b.bullets.length > 0 || b.header.includes("|"));
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Gắn mỗi khối AI trả về với dòng thô (rawId) bằng tên; không khớp thì theo thứ tự. */
export function attachRawIds(blocks: { header: string; bullets: string[] }[], names: { id: string; name: string }[]): GeneratedSection[] {
  const used = new Set<string>();
  return blocks.map((b, i) => {
    const h = norm(b.header);
    let hit = names.find((n) => !used.has(n.id) && n.name && (h.includes(norm(n.name)) || norm(n.name).includes(h.split("|")[0].trim())));
    if (!hit) hit = names.filter((n) => !used.has(n.id))[0] ?? names[i];
    if (hit) used.add(hit.id);
    return { rawId: hit?.id ?? "", header: b.header, bullets: b.bullets };
  });
}

export function parseExperience(text: string, cv: CvData): { sections: GeneratedSection[]; notes: string } {
  const { body, notes } = splitNotes(text);
  const blocks = parseBlocks(body).map((b) => ({
    // Bỏ phần [MM/YYYY – MM/YYYY] — thời gian lấy từ dữ liệu thô, không lấy từ AI
    header: b.header.split("|").slice(0, 2).map((s) => s.trim()).join(" | "),
    bullets: b.bullets,
  }));
  const names = cv.raw.experience.map((e) => ({ id: e.id, name: e.company }));
  return { sections: attachRawIds(blocks, names), notes };
}

export function parseProjects(text: string, cv: CvData): { sections: GeneratedSection[]; notes: string } {
  const { body, notes } = splitNotes(text);
  const blocks = parseBlocks(body).map((b) => ({
    header: b.header.split("|").slice(0, 2).map((s) => s.trim()).join(" | "),
    bullets: b.bullets,
  }));
  const names = cv.raw.projects.map((p) => ({ id: p.id, name: p.name }));
  return { sections: attachRawIds(blocks, names), notes };
}
