import type { CvData, GeneratedSection } from "./schema";
import { toView } from "./view";
import { parseBlocks, attachRawIds } from "./generate";

export type Tailored = {
  aboutMe: string;
  experience: GeneratedSection[];
  projects: GeneratedSection[];
  skills: { hard: string; soft: string };
  keywordsUsed: string;
  suggestions: string;
};

/** CV hiện tại → plain text theo đúng format prompt tailor yêu cầu. */
export function cvToPlainText(cv: CvData): string {
  const v = toView(cv);
  const out: string[] = [];
  if (v.aboutMe) out.push("ABOUT ME", v.aboutMe, "");
  if (v.experience.length) {
    out.push("WORK EXPERIENCE");
    for (const e of v.experience) { out.push(e.header); e.bullets.forEach((b) => out.push(`- ${b}`)); out.push(""); }
  }
  if (v.projects.length) {
    out.push("PROJECTS");
    for (const p of v.projects) { out.push(p.header); p.bullets.forEach((b) => out.push(`- ${b}`)); out.push(""); }
  }
  if (v.skills.hard || v.skills.soft) {
    out.push("SKILLS");
    if (v.skills.hard) { out.push("Hard skills:"); v.skills.hard.split("\n").filter((l) => l.trim()).forEach((l) => out.push(`- ${l.replace(/^(?:[-•]\s*|\*\s+)/, "").trim()}`)); }
    if (v.skills.soft) { out.push("Soft skills:"); v.skills.soft.split("\n").filter((l) => l.trim()).forEach((l) => out.push(`- ${l.replace(/^(?:[-•]\s*|\*\s+)/, "").trim()}`)); }
  }
  return out.join("\n");
}

const HEADS = ["ABOUT ME", "WORK EXPERIENCE", "PROJECTS", "SKILLS", "KEYWORD ĐÃ LỒNG", "GỢI Ý BỔ SUNG"];

function splitSections(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  let cur = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const head = HEADS.find((h) => line.toUpperCase().replace(/[:：]$/, "") === h);
    if (head) { cur = head; map[cur] = ""; continue; }
    if (cur) map[cur] += raw + "\n";
  }
  return map;
}

/** "Hard skills:\n- a\n- b\nSoft skills:\n- c" (hoặc 1 dòng "Hard skills: a, b") → {hard, soft} nhiều dòng. */
function parseSkills(text: string): { hard?: string; soft?: string } {
  const out: { hard?: string; soft?: string } = {};
  let cur: "hard" | "soft" | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/^(?:[-•]\s*|\*\s+)/, "").trim();
    if (!line) continue;
    const m = line.match(/^(hard|soft)\s*skills?\s*[:：]?\s*(.*)$/i);
    if (m) { cur = m[1].toLowerCase() as "hard" | "soft"; out[cur] = m[2].trim(); continue; }
    if (cur) out[cur] = [out[cur], line].filter(Boolean).join("\n");
  }
  return out;
}

export function parseTailored(text: string, cv: CvData): Tailored | null {
  const s = splitSections(text);
  if (!s["ABOUT ME"] && !s["WORK EXPERIENCE"]) return null;
  const sk = parseSkills(s["SKILLS"] ?? "");
  const hard = sk.hard ?? cv.raw.skills.hard;
  const soft = sk.soft ?? cv.raw.skills.soft;
  const expBlocks = parseBlocks(s["WORK EXPERIENCE"] ?? "").map((b) => ({ header: b.header.split("|").slice(0, 2).map((x) => x.trim()).join(" | "), bullets: b.bullets }));
  const prjBlocks = parseBlocks(s["PROJECTS"] ?? "").map((b) => ({ header: b.header.split("|").slice(0, 2).map((x) => x.trim()).join(" | "), bullets: b.bullets }));
  return {
    aboutMe: (s["ABOUT ME"] ?? "").trim(),
    experience: attachRawIds(expBlocks, cv.raw.experience.map((e) => ({ id: e.id, name: e.company }))),
    projects: attachRawIds(prjBlocks, cv.raw.projects.map((p) => ({ id: p.id, name: p.name }))),
    skills: { hard, soft },
    keywordsUsed: (s["KEYWORD ĐÃ LỒNG"] ?? "").trim(),
    suggestions: (s["GỢI Ý BỔ SUNG"] ?? "").trim(),
  };
}

/** Ghép bản tùy biến lên CV gốc → CvData để template/preview/export dùng như bình thường. */
export function applyTailored(cv: CvData, t: Tailored): CvData {
  return {
    ...cv,
    raw: { ...cv.raw, skills: t.skills },
    generated: {
      ...cv.generated,
      aboutMe: { options: [t.aboutMe], chosen: 0, final: t.aboutMe },
      experience: t.experience.length ? t.experience : cv.generated.experience,
      projects: t.projects.length ? t.projects : cv.generated.projects,
    },
  };
}
