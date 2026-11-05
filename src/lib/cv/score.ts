import type { CvData } from "./schema";

export type ScoreItem = { label: string; weight: number; done: boolean; step: number };

/** Mức hoàn thiện CV (0–100) + việc nên làm tiếp. Trọng số nghiêng về phần recruiter đọc trước. */
export function cvScore(cv: CvData): { percent: number; next: ScoreItem | null; items: ScoreItem[] } {
  const b = cv.basics, r = cv.raw, g = cv.generated;
  const has = (s: string) => s.trim().length > 0;
  const items: ScoreItem[] = [
    { label: "Thêm họ tên", weight: 6, done: has(b.fullName), step: 0 },
    { label: "Thêm email", weight: 4, done: has(b.email), step: 0 },
    { label: "Thêm số điện thoại", weight: 3, done: has(b.phone), step: 0 },
    { label: "Thêm link LinkedIn", weight: 3, done: has(b.linkedin), step: 0 },
    { label: "Thêm link GitHub", weight: 4, done: has(b.github), step: 0 },
    { label: "Trả lời 3 ý About Me", weight: 8, done: has(r.aboutMe.whoAmI) && has(r.aboutMe.strengths) && has(r.aboutMe.goal), step: 1 },
    { label: "Để AI viết About Me", weight: 6, done: has(g.aboutMe.final), step: 1 },
    { label: "Thêm ít nhất 1 kinh nghiệm", weight: 10, done: r.experience.some((e) => has(e.company) && e.tasks.some((t) => has(t.what))), step: 2 },
    { label: "Điền Impact (số liệu) cho kinh nghiệm", weight: 6, done: r.experience.some((e) => e.tasks.some((t) => has(t.impact))), step: 2 },
    { label: "Để AI viết Work Experience", weight: 8, done: g.experience.length > 0, step: 2 },
    { label: "Thêm ít nhất 2 project", weight: 10, done: r.projects.filter((p) => has(p.name)).length >= 2, step: 3 },
    { label: "Gắn link GitHub cho project", weight: 4, done: r.projects.some((p) => has(p.link)), step: 3 },
    { label: "Để AI viết Projects", weight: 8, done: g.projects.length > 0, step: 3 },
    { label: "Liệt kê Hard skills", weight: 8, done: has(r.skills.hard), step: 4 },
    { label: "Liệt kê Soft skills", weight: 3, done: has(r.skills.soft), step: 4 },
    { label: "Thêm học vấn", weight: 6, done: r.education.some((e) => has(e.school)), step: 5 },
    { label: "Thêm chứng chỉ", weight: 3, done: r.achievements.some((a) => has(a.text)), step: 6 },
  ];
  const total = items.reduce((s, i) => s + i.weight, 0);
  const got = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  const next = items.filter((i) => !i.done).sort((a, b) => b.weight - a.weight)[0] ?? null;
  return { percent: Math.round((got / total) * 100), next, items };
}
