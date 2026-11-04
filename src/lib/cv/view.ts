import type { CvData, ExperienceItem, ProjectItem } from "./schema";

/**
 * Chuyển CvData thành "view model" cho template.
 * Có bản AI (generated) thì dùng; chưa có thì dựng tạm từ dữ liệu thô
 * để học viên thấy preview ngay từ khi gõ.
 */

export type CvView = {
  basics: CvData["basics"];
  aboutMe: string;
  experience: { header: string; period: string; bullets: string[] }[];
  projects: { header: string; link: string; bullets: string[] }[];
  skills: { hard: string; soft: string };
  education: { line: string; years: string; note: string }[];
  achievements: { text: string; link: string }[];
  isDraft: boolean;
};

const nonEmpty = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);

export function fmtMonth(ym: string): string {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return m && y ? `${m}/${y}` : ym;
}

export function period(e: ExperienceItem): string {
  const a = fmtMonth(e.startDate);
  const b = e.current ? "Present" : fmtMonth(e.endDate);
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
  const aboutGen = g.aboutMe.final || g.aboutMe.options[g.aboutMe.chosen] || "";
  const aboutDraft = nonEmpty([cv.raw.aboutMe.whoAmI, cv.raw.aboutMe.strengths, cv.raw.aboutMe.goal]).join(". ");
  const hasGen = Boolean(aboutGen || g.experience.length || g.projects.length);

  const experience = g.experience.length
    ? g.experience.map((s) => {
        const e = cv.raw.experience.find((x) => x.id === s.rawId);
        return { header: s.header, period: e ? period(e) : "", bullets: nonEmpty(s.bullets) };
      })
    : cv.raw.experience.map((e) => ({
        header: nonEmpty([e.company, e.role]).join(" | "),
        period: period(e),
        bullets: draftExperience(e),
      }));

  const projects = g.projects.length
    ? g.projects.map((s) => {
        const p = cv.raw.projects.find((x) => x.id === s.rawId);
        return { header: s.header, link: p?.link ?? "", bullets: nonEmpty(s.bullets) };
      })
    : cv.raw.projects.map((p) => ({
        header: nonEmpty([p.name, p.tools]).join(" | "),
        link: p.link,
        bullets: draftProject(p),
      }));

  return {
    basics: cv.basics,
    aboutMe: aboutGen || aboutDraft,
    experience,
    projects,
    skills: cv.raw.skills,
    education: cv.raw.education.map((e) => ({
      line: nonEmpty([e.school, e.major]).join(" – ") + (e.gpa ? ` · GPA ${e.gpa}` : ""),
      years: e.years,
      note: e.note,
    })),
    achievements: cv.raw.achievements.map((a) => ({ text: a.text, link: a.link })),
    isDraft: !hasGen,
  };
}
