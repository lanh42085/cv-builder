"use client";

import type { CvData } from "@/lib/cv/schema";
import { emptyAchievement, emptyEducation, emptyExperience, emptyProject } from "@/lib/cv/schema";
import { AddButton, Field, Intro, ItemCard } from "./fields";
import { AiAbout, AiSection } from "./AiPanel";

type Props = { cv: CvData; set: (fn: (cv: CvData) => CvData) => void };

export const STEPS = [
  "Thông tin cá nhân",
  "About Me",
  "Experience",
  "Projects",
  "Skills",
  "Education",
  "Achievement",
] as const;

export function StepBasics({ cv, set }: Props) {
  const b = cv.basics;
  const up = (k: keyof CvData["basics"]) => (v: string) => set((c) => ({ ...c, basics: { ...c.basics, [k]: v } }));
  return (
    <div className="grid gap-3">
      <Field label="Họ tên" hint="Sẽ in HOA trên CV" value={b.fullName} onChange={up("fullName")} placeholder="Nguyễn Văn A" />
      <Field label="Vị trí ứng tuyển" hint="Đúng tên trong JD" value={b.headline} onChange={up("headline")} placeholder="Data Analyst (Fresher)" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Số điện thoại" value={b.phone} onChange={up("phone")} placeholder="(+84) 9xx xxx xxx" />
        <Field label="Email" value={b.email} onChange={up("email")} placeholder="a@gmail.com" type="email" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="LinkedIn" value={b.linkedin} onChange={up("linkedin")} placeholder="linkedin.com/in/..." />
        <Field label="GitHub" value={b.github} onChange={up("github")} placeholder="github.com/..." />
      </div>
      <Field label="Link portfolio (nếu có)" value={b.portfolioUrl} onChange={up("portfolioUrl")} placeholder="username.github.io" />
      <Field label="Thành phố" value={b.location} onChange={up("location")} placeholder="Hà Nội" />
    </div>
  );
}

export function StepAbout({ cv, set }: Props) {
  const a = cv.raw.aboutMe;
  const up = (k: keyof CvData["raw"]["aboutMe"]) => (v: string) =>
    set((c) => ({ ...c, raw: { ...c.raw, aboutMe: { ...c.raw.aboutMe, [k]: v } } }));
  return (
    <div className="grid gap-3">
      <Intro>Nhà tuyển dụng đọc phần này đầu tiên. Trả lời 3 ý bằng 1 câu ngắn mỗi ý, AI sẽ gộp thành một đoạn ≤ 3 dòng.</Intro>
      <Field label="1. Bạn là ai" hint="Title + nền tảng (ngành học / số năm kinh nghiệm)" value={a.whoAmI} onChange={up("whoAmI")}
        placeholder="Sinh viên Kinh tế mới tốt nghiệp, định hướng Data Analyst" multiline />
      <Field label="2. Bạn mạnh gì" hint="2–3 tool / kỹ năng có bằng chứng" value={a.strengths} onChange={up("strengths")}
        placeholder="SQL, Power BI, Excel; có project phân tích dữ liệu thực tế" multiline />
      <Field label="3. Bạn muốn gì" hint="1 câu về hướng đi, gắn với ngành của công ty" value={a.goal} onChange={up("goal")}
        placeholder="Muốn dùng dữ liệu hỗ trợ quyết định kinh doanh" multiline />
      <AiAbout cv={cv} set={set} />
    </div>
  );
}

export function StepExperience({ cv, set }: Props) {
  const items = cv.raw.experience;
  const upItem = (id: string, patch: Partial<CvData["raw"]["experience"][number]>) =>
    set((c) => ({ ...c, raw: { ...c.raw, experience: c.raw.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) } }));
  const remove = (id: string) => set((c) => ({ ...c, raw: { ...c.raw, experience: c.raw.experience.filter((e) => e.id !== id) } }));
  const add = () => set((c) => ({ ...c, raw: { ...c.raw, experience: [...c.raw.experience, emptyExperience()] } }));

  return (
    <div className="grid gap-4">
      <Intro>Mỗi thẻ = 1 kinh nghiệm/thành tựu nổi bật. Một công ty có nhiều thành tựu thì tạo nhiều thẻ cùng tên công ty. Việc gần nhất xếp trên. Viết bằng lời của bạn, chưa cần hay, chưa cần nhìn JD.</Intro>
      {items.map((e, i) => (
        <ItemCard key={e.id} title={`Kinh nghiệm ${i + 1}${e.company ? ` — ${e.company}` : ""}`} onRemove={() => remove(e.id)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Công ty" value={e.company} onChange={(v) => upItem(e.id, { company: v })} />
            <Field label="Vị trí" hint="Giữ chức danh gốc" value={e.role} onChange={(v) => upItem(e.id, { role: v })} />
          </div>
          <div className="grid grid-cols-3 items-end gap-3">
            <Field label="Từ" value={e.startDate} onChange={(v) => upItem(e.id, { startDate: v })} type="month" />
            <Field label="Đến" value={e.endDate} onChange={(v) => upItem(e.id, { endDate: v })} type="month" />
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={e.current} onChange={(ev) => upItem(e.id, { current: ev.target.checked })} /> Đang làm
            </label>
          </div>
          <Field label="Problem – Vấn đề là gì?" hint="Bối cảnh / vấn đề" value={e.problem} onChange={(v) => upItem(e.id, { problem: v })} multiline />
          <Field label="What – Làm gì?" hint="Nhiệm vụ cụ thể của BẠN" value={e.what} onChange={(v) => upItem(e.id, { what: v })} multiline />
          <Field label="For Who – Cho ai?" hint="Team / phòng ban dùng kết quả" value={e.forWho} onChange={(v) => upItem(e.id, { forWho: v })} />
          <Field label="How – Làm như thế nào?" hint="Tool gì, phương pháp gì" value={e.how} onChange={(v) => upItem(e.id, { how: v })} multiline />
          <Field label="Outcome – Thành phẩm" hint="Ví dụ: báo cáo dòng tiền, dashboard..." value={e.outcome} onChange={(v) => upItem(e.id, { outcome: v })} />
          <Field label="Impact – Ảnh hưởng tích cực" hint="Kết quả đo được (%, giờ, tiền). Chưa có số → để trống, KHÔNG bịa" value={e.impact} onChange={(v) => upItem(e.id, { impact: v })} />
        </ItemCard>
      ))}
      <AddButton onClick={add}>+ Thêm kinh nghiệm</AddButton>
      <AiSection cv={cv} set={set} kind="experience" />
    </div>
  );
}

export function StepProjects({ cv, set }: Props) {
  const items = cv.raw.projects;
  const upItem = (id: string, patch: Partial<CvData["raw"]["projects"][number]>) =>
    set((c) => ({ ...c, raw: { ...c.raw, projects: c.raw.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) } }));
  const remove = (id: string) => set((c) => ({ ...c, raw: { ...c.raw, projects: c.raw.projects.filter((p) => p.id !== id) } }));
  const add = () => set((c) => ({ ...c, raw: { ...c.raw, projects: [...c.raw.projects, emptyProject()] } }));

  return (
    <div className="grid gap-4">
      <Intro>Mỗi thẻ = 1 project. Rất quan trọng nếu ít kinh nghiệm. Gắn link GitHub / dashboard public.</Intro>
      {items.map((p, i) => (
        <ItemCard key={p.id} title={`Project ${i + 1}${p.name ? ` — ${p.name}` : ""}`} onRemove={() => remove(p.id)}>
          <Field label="Tên project" hint="Ngắn, rõ chủ đề" value={p.name} onChange={(v) => upItem(p.id, { name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tool" value={p.tools} onChange={(v) => upItem(p.id, { tools: v })} placeholder="SQL, Power BI" />
            <Field label="Link" value={p.link} onChange={(v) => upItem(p.id, { link: v })} placeholder="github.com/..." />
          </div>
          <Field label="S – Situation" hint="Giải quyết bài toán gì? Mục tiêu?" value={p.situation} onChange={(v) => upItem(p.id, { situation: v })} multiline />
          <Field label="T – Task" hint="Các bước chính để đạt mục tiêu" value={p.task} onChange={(v) => upItem(p.id, { task: v })} multiline />
          <Field label="A – Action" hint="Tool/technique nào trên nền tảng nào" value={p.action} onChange={(v) => upItem(p.id, { action: v })} multiline />
          <Field label="R – Result" hint="Insight rút ra? Giải quyết mục tiêu thế nào?" value={p.result} onChange={(v) => upItem(p.id, { result: v })} multiline />
        </ItemCard>
      ))}
      <AddButton onClick={add}>+ Thêm project</AddButton>
      <AiSection cv={cv} set={set} kind="projects" />
    </div>
  );
}

export function StepSkills({ cv, set }: Props) {
  const s = cv.raw.skills;
  const up = (k: "hard" | "soft") => (v: string) => set((c) => ({ ...c, raw: { ...c.raw, skills: { ...c.raw.skills, [k]: v } } }));
  return (
    <div className="grid gap-3">
      <Intro>Chỉ ghi skill đã học VÀ có bằng chứng (project/công việc). Cách nhau bằng dấu phẩy.</Intro>
      <Field label="Hard skill" value={s.hard} onChange={up("hard")} placeholder="SQL, Power BI, Excel (Pivot, Power Query), Python" multiline />
      <Field label="Soft skill" value={s.soft} onChange={up("soft")} placeholder="Analytical thinking, problem solving, attention to detail" multiline />
    </div>
  );
}

export function StepEducation({ cv, set }: Props) {
  const items = cv.raw.education;
  const upItem = (id: string, patch: Partial<CvData["raw"]["education"][number]>) =>
    set((c) => ({ ...c, raw: { ...c.raw, education: c.raw.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) } }));
  const remove = (id: string) => set((c) => ({ ...c, raw: { ...c.raw, education: c.raw.education.filter((e) => e.id !== id) } }));
  const add = () => set((c) => ({ ...c, raw: { ...c.raw, education: [...c.raw.education, emptyEducation()] } }));
  return (
    <div className="grid gap-4">
      <Intro>2–3 dòng. Chỉ ghi GPA nếu ≥ 3.0/4 hoặc ≥ 7.5/10.</Intro>
      {items.map((e, i) => (
        <ItemCard key={e.id} title={`Học vấn ${i + 1}`} onRemove={() => remove(e.id)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trường" value={e.school} onChange={(v) => upItem(e.id, { school: v })} placeholder="ĐH Kinh tế Quốc dân" />
            <Field label="Ngành" value={e.major} onChange={(v) => upItem(e.id, { major: v })} placeholder="Quản trị kinh doanh" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Năm" value={e.years} onChange={(v) => upItem(e.id, { years: v })} placeholder="2018 – 2022" />
            <Field label="GPA (bỏ nếu không nổi bật)" value={e.gpa} onChange={(v) => upItem(e.id, { gpa: v })} placeholder="3.2/4.0" />
          </div>
          <Field label="Mô tả ngắn" hint="Môn / khoá học liên quan data, học bổng" value={e.note} onChange={(v) => upItem(e.id, { note: v })} />
        </ItemCard>
      ))}
      <AddButton onClick={add}>+ Thêm học vấn</AddButton>
    </div>
  );
}

export function StepAchievements({ cv, set }: Props) {
  const items = cv.raw.achievements;
  const upItem = (id: string, patch: Partial<CvData["raw"]["achievements"][number]>) =>
    set((c) => ({ ...c, raw: { ...c.raw, achievements: c.raw.achievements.map((a) => (a.id === id ? { ...a, ...patch } : a)) } }));
  const remove = (id: string) => set((c) => ({ ...c, raw: { ...c.raw, achievements: c.raw.achievements.filter((a) => a.id !== id) } }));
  const add = () => set((c) => ({ ...c, raw: { ...c.raw, achievements: [...c.raw.achievements, emptyAchievement()] } }));
  return (
    <div className="grid gap-4">
      <Intro>Chỉ ghi cái liên quan Data hoặc thể hiện năng lực nổi bật, kèm link xác thực nếu có.</Intro>
      {items.map((a, i) => (
        <ItemCard key={a.id} title={`Mục ${i + 1}`} onRemove={() => remove(a.id)}>
          <Field label="Chứng chỉ / thành tích" value={a.text} onChange={(v) => upItem(a.id, { text: v })} placeholder="Google Data Analytics (Coursera, 2025)" />
          <Field label="Link xác thực" value={a.link} onChange={(v) => upItem(a.id, { link: v })} />
        </ItemCard>
      ))}
      <AddButton onClick={add}>+ Thêm</AddButton>
    </div>
  );
}
