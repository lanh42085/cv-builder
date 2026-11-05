/** Kiểu dữ liệu CV — phản chiếu đúng 7 phần của sheet "CV & Linkedin". */
import { DEFAULT_ORDER, DEFAULT_STYLE, normalizeOrder, normalizeStyle, type CvStyle, type SectionKey, type TemplateId } from "./style";

export type Basics = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolioUrl: string;
};

export type AboutRaw = { whoAmI: string; strengths: string; goal: string };

/** Một việc / thành tựu trong một công ty — một dòng STAR của sheet. */
export type ExperienceTask = {
  id: string;
  problem: string;
  what: string;
  forWho: string;
  how: string;
  outcome: string;
  impact: string;
};

/** Một công ty; một công ty có nhiều việc. */
export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate: string;   // YYYY-MM, rỗng khi current
  current: boolean;
  tasks: ExperienceTask[];
};

export type ProjectItem = {
  id: string;
  name: string;
  tools: string;
  link: string;
  situation: string;
  task: string;
  action: string;
  result: string;
};

export type EducationItem = { id: string; school: string; major: string; years: string; gpa: string; note: string };
export type AchievementItem = { id: string; text: string; link: string };
export type Skills = { hard: string; soft: string };

export type GeneratedSection = { rawId: string; header: string; bullets: string[] };
export type Generated = {
  aboutMe: { options: string[]; chosen: number; final: string };
  experience: GeneratedSection[];
  projects: GeneratedSection[];
  notes: string;
};

export type CvData = {
  schemaVersion: 2;
  templateId: TemplateId;
  cvLanguage: "en" | "vi";
  style: CvStyle;
  sectionOrder: SectionKey[];
  basics: Basics;
  raw: {
    aboutMe: AboutRaw;
    experience: ExperienceItem[];
    projects: ProjectItem[];
    skills: Skills;
    education: EducationItem[];
    achievements: AchievementItem[];
  };
  generated: Generated;
};

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyTask(): ExperienceTask {
  return { id: newId(), problem: "", what: "", forWho: "", how: "", outcome: "", impact: "" };
}
export function emptyExperience(): ExperienceItem {
  return { id: newId(), company: "", role: "", startDate: "", endDate: "", current: false, tasks: [emptyTask()] };
}
export function emptyProject(): ProjectItem {
  return { id: newId(), name: "", tools: "", link: "", situation: "", task: "", action: "", result: "" };
}
export function emptyEducation(): EducationItem {
  return { id: newId(), school: "", major: "", years: "", gpa: "", note: "" };
}
export function emptyAchievement(): AchievementItem {
  return { id: newId(), text: "", link: "" };
}

export function emptyCv(): CvData {
  return {
    schemaVersion: 2,
    templateId: "ats-single",
    cvLanguage: "en",
    style: { ...DEFAULT_STYLE },
    sectionOrder: [...DEFAULT_ORDER],
    basics: { fullName: "", headline: "Data Analyst", email: "", phone: "", location: "", linkedin: "", github: "", portfolioUrl: "" },
    raw: {
      aboutMe: { whoAmI: "", strengths: "", goal: "" },
      experience: [],
      projects: [],
      skills: { hard: "", soft: "" },
      education: [],
      achievements: [],
    },
    generated: { aboutMe: { options: [], chosen: 0, final: "" }, experience: [], projects: [], notes: "" },
  };
}

/** Dòng cũ (STAR nằm ngay trên công ty) → chuyển thành 1 công ty có 1 việc. */
function normalizeExperience(e: unknown): ExperienceItem {
  const o = (e ?? {}) as Partial<ExperienceItem> & Partial<ExperienceTask>;
  const base = emptyExperience();
  const tasks = Array.isArray(o.tasks) && o.tasks.length
    ? o.tasks.map((t) => ({ ...emptyTask(), ...t }))
    : [{ ...emptyTask(), problem: o.problem ?? "", what: o.what ?? "", forWho: o.forWho ?? "",
         how: o.how ?? "", outcome: o.outcome ?? "", impact: o.impact ?? "" }];
  return { id: o.id ?? base.id, company: o.company ?? "", role: o.role ?? "", startDate: o.startDate ?? "",
    endDate: o.endDate ?? "", current: Boolean(o.current), tasks };
}

/** Ghép dữ liệu đọc từ DB (có thể thiếu field) lên bộ mặc định, để code không bao giờ gặp undefined. */
export function normalizeCv(input: unknown): CvData {
  const base = emptyCv();
  if (!input || typeof input !== "object") return base;
  const d = input as Partial<CvData>;
  const raw = (d.raw ?? {}) as Partial<CvData["raw"]>;
  const gen = (d.generated ?? {}) as Partial<Generated>;
  return {
    ...base,
    templateId: "ats-single", // mẫu cột đôi tạm ẩn
    style: normalizeStyle(d.style),
    sectionOrder: normalizeOrder(d.sectionOrder),
    cvLanguage: d.cvLanguage ?? base.cvLanguage,
    basics: { ...base.basics, ...(d.basics ?? {}) },
    raw: {
      aboutMe: { ...base.raw.aboutMe, ...(raw.aboutMe ?? {}) },
      experience: Array.isArray(raw.experience) ? raw.experience.map(normalizeExperience) : [],
      projects: Array.isArray(raw.projects) ? raw.projects.map((p) => ({ ...emptyProject(), ...p })) : [],
      skills: { ...base.raw.skills, ...(raw.skills ?? {}) },
      education: Array.isArray(raw.education) ? raw.education.map((e) => ({ ...emptyEducation(), ...e })) : [],
      achievements: Array.isArray(raw.achievements) ? raw.achievements.map((a) => ({ ...emptyAchievement(), ...a })) : [],
    },
    generated: {
      aboutMe: { ...base.generated.aboutMe, ...(gen.aboutMe ?? {}) },
      experience: Array.isArray(gen.experience) ? gen.experience : [],
      projects: Array.isArray(gen.projects) ? gen.projects : [],
      notes: gen.notes ?? "",
    },
  };
}
