/** Kiểu dữ liệu CV — phản chiếu đúng 7 phần của sheet "CV & Linkedin". */

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

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate: string;   // YYYY-MM, rỗng khi current
  current: boolean;
  problem: string;
  what: string;
  forWho: string;
  how: string;
  outcome: string;
  impact: string;
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
  templateId: "ats-single" | "two-column";
  cvLanguage: "en" | "vi";
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

export function emptyExperience(): ExperienceItem {
  return { id: newId(), company: "", role: "", startDate: "", endDate: "", current: false,
    problem: "", what: "", forWho: "", how: "", outcome: "", impact: "" };
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

/** Ghép dữ liệu đọc từ DB (có thể thiếu field) lên bộ mặc định, để code không bao giờ gặp undefined. */
export function normalizeCv(input: unknown): CvData {
  const base = emptyCv();
  if (!input || typeof input !== "object") return base;
  const d = input as Partial<CvData>;
  const raw = (d.raw ?? {}) as Partial<CvData["raw"]>;
  const gen = (d.generated ?? {}) as Partial<Generated>;
  return {
    ...base,
    templateId: d.templateId ?? base.templateId,
    cvLanguage: d.cvLanguage ?? base.cvLanguage,
    basics: { ...base.basics, ...(d.basics ?? {}) },
    raw: {
      aboutMe: { ...base.raw.aboutMe, ...(raw.aboutMe ?? {}) },
      experience: Array.isArray(raw.experience) ? raw.experience.map((e) => ({ ...emptyExperience(), ...e })) : [],
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
