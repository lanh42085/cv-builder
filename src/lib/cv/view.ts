import type { CvData, ExperienceItem, ProjectItem } from "./schema";
import type { DateFormat } from "./style";

/**
 * Chuyển CvData thành "view model" cho template.
 * Có bản AI (generated) thì dùng; chưa có thì dựng tạm từ dữ liệu thô
 * để học viên thấy preview ngay từ khi gõ.
 */

export type CvView = {
  basics: CvData["basics"];
  aboutMe: string;
  aboutSrc: string | null;
  experience: { header: string; period: string; bullets: string[]; srcs: (string | null)[] }[];
  projects: { header: string; link: string; bullets: string[]; srcs: (string | null)[] }[];
  skills: { hard: string; soft: string };
  education: { line: string; years: string; note: string; noteSrc: string }[];
  achievements: { text: string; link: string; src: string }[];
  isDraft: boolean;
};

const nonEmpty = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtMonth(ym: string, fmt: DateFormat = "MM/YYYY"): string {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  if (!m || !y) return ym;
  if (fmt === "Mon YYYY") return `${MONTHS[Number(m) - 1] ?? m} ${y}`;
  if (fmt === "YYYY-MM") return `${y}-${m}`;
  return `${m}/${y}`;
}

export function period(e: ExperienceItem, fmt: DateFormat = "MM/YYYY"): string {
  const a = fmtMonth(e.startDate, fmt);
  const b = e.current ? "Present" : fmtMonth(e.endDate, fmt);
  if (!a && !b) return "";
  return `${a || "?"} – ${b || "?"}`;
}

function draftExperience(e: ExperienceItem): string[] {
  return e.tasks.map((t) => {
    const parts = [
      t.what ? t.what + (t.forWho ? ` (cho ${t.forWho})` : "") : "",
      t.how,
      nonEmpty([t.outcome, t.impact]).join(" — "),
    ];
    return nonEmpty(parts).join(". ");
  }).filter(Boolean);
}

function draftProject(p: ProjectItem): string[] {
  return nonEmpty([p.action, p.result]);
}

export function toView(cv: CvData): CvView {
  const g = cv.generated;
  const df = cv.style.layout.dateFormat;
  const aboutGen = g.aboutMe.final || g.aboutMe.options[g.aboutMe.chosen] || "";
  const aboutDraft = nonEmpty([cv.raw.aboutMe.whoAmI, cv.raw.aboutMe.strengths, cv.raw.aboutMe.goal]).join(". ");
  const hasGen = Boolean(aboutGen || g.experience.length || g.projects.length);

  const experience = g.experience.length
    ? g.experience.map((s, i) => {
        const e = cv.raw.experience.find((x) => x.id === s.rawId);
        const idx = s.bullets.map((b, j) => (b.trim() ? j : -1)).filter((j) => j >= 0);
        return { header: s.header, period: e ? period(e, df) : "", bullets: idx.map((j) => s.bullets[j].trim()),
          srcs: idx.map((j) => `generated.experience.${i}.bullets.${j}`) };
      })
    : cv.raw.experience.map((e) => {
        const bullets = draftExperience(e);
        return { header: nonEmpty([e.company, e.role]).join(" | "), period: period(e, df), bullets, srcs: bullets.map(() => null) };
      });

  const projects = g.projects.length
    ? g.projects.map((s, i) => {
        const p = cv.raw.projects.find((x) => x.id === s.rawId);
        const idx = s.bullets.map((b, j) => (b.trim() ? j : -1)).filter((j) => j >= 0);
        return { header: s.header, link: p?.link ?? "", bullets: idx.map((j) => s.bullets[j].trim()),
          srcs: idx.map((j) => `generated.projects.${i}.bullets.${j}`) };
      })
    : cv.raw.projects.map((p) => {
        const bullets = draftProject(p);
        return { header: nonEmpty([p.name, p.tools]).join(" | "), link: p.link, bullets, srcs: bullets.map(() => null) };
      });

  return {
    basics: cv.basics,
    aboutMe: aboutGen || aboutDraft,
    aboutSrc: aboutGen ? "generated.aboutMe.final" : null,
    experience,
    projects,
    skills: cv.raw.skills,
    education: cv.raw.education.map((e, i) => ({
      line: nonEmpty([e.school, e.major]).join(" – ") + (e.gpa ? ` · GPA ${e.gpa}` : ""),
      years: e.years,
      note: e.note,
      noteSrc: `raw.education.${i}.note`,
    })),
    achievements: cv.raw.achievements.map((a, i) => ({ text: a.text, link: a.link, src: `raw.achievements.${i}.text` })),
    isDraft: !hasGen,
  };
}

/** "a\nb: c" → [{label:"", text:"a"}, {label:"b", text:"c"}] — mỗi dòng 1 bullet, "Nhóm: chi tiết" tách nhãn.
 *  Nhãn luôn in đậm sẵn nên dấu ** quanh nhãn được bỏ; dấu ** lẻ còn sót trong phần chi tiết được dọn. */
export function skillLines(raw: string, keepEmpty = false): { label: string; text: string }[] {
  return raw.split("\n").map((l) => l.replace(/^(?:[-•]\s*|\*\s+)/, "").trim()).filter((l) => keepEmpty || l).map((l) => {
    const i = l.search(/[:：]/);
    const before = i >= 0 ? l.slice(0, i).replace(/\*\*|__/g, "").trim() : "";
    if (i < 0 || before.length === 0 || before.length > 40) return { label: "", text: l };
    let text = l.slice(i + 1).trim();
    if ((text.match(/\*\*/g) ?? []).length % 2 === 1) text = text.replace("**", "").trim();
    if ((text.match(/__/g) ?? []).length % 2 === 1) text = text.replace("__", "").trim();
    return { label: before, text };
  });
}
