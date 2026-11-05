import { AlignmentType, Document, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { CvData } from "./schema";
import { skillLines, toView } from "./view";
import { FONTS } from "./style";
import { parseInline } from "./inline";

/** File Word 1 cột, không bảng — bản để nộp qua hệ thống ATS. Cùng bố cục với template 1 cột. */
export async function cvToDocx(cv: CvData): Promise<Buffer> {
  const v = toView(cv);
  const FONT = FONTS[cv.style.font].docx;
  const ACCENT = cv.style.accent.replace("#", "").toUpperCase();
  const RIGHT = 9638; // twips ~ lề phải A4 với margin 2cm
  const SZ = 22;      // 11pt
  const P: Paragraph[] = [];

  const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
    new TextRun({ text, bold: o.bold, italics: o.italics, size: o.size ?? SZ, font: FONT, color: o.color });

  const heading = (t: string) => new Paragraph({
    spacing: { before: 200, after: 60 },
    border: { bottom: { style: "single", size: 8, color: ACCENT, space: 1 } },
    children: [run(t.toUpperCase(), { bold: true, size: 25, color: ACCENT })],
  });
  const para = (t: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string; center?: boolean; justify?: boolean } = {}) => new Paragraph({
    alignment: o.center ? AlignmentType.CENTER : o.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
    spacing: { after: 20 }, children: runs(t, o),
  });
  const twoSide = (left: string, right: string, o: { bold?: boolean; italics?: boolean } = {}) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }], spacing: { before: 60, after: 10 },
    children: [run(left, o), run(right ? `\t${right}` : "", { italics: true })],
  });
  const runs = (t: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
    parseInline(t).map((r) => run(r.text, { ...o, bold: o.bold || r.bold, italics: o.italics || r.italic }));
  const bullet = (t: string) => new Paragraph({
    bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 20 }, children: runs(t),
  });
  const bulletRuns = (children: TextRun[]) => new Paragraph({
    bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 20 }, children,
  });

  const b = v.basics;
  const line1 = [b.location, b.phone, b.email].filter((x) => x.trim()).join("  |  ");
  const line2 = [b.linkedin.trim() && `LinkedIn: ${b.linkedin.trim()}`, b.github.trim() && `GitHub: ${b.github.trim()}`,
    b.portfolioUrl.trim() && `Portfolio: ${b.portfolioUrl.trim()}`].filter(Boolean).join("  |  ");
  P.push(para(b.fullName.toUpperCase() || "HO VA TEN", { bold: true, size: 30, color: ACCENT, center: true }));
  P.push(para(b.headline || "Data Analyst", { size: 23, center: true }));
  if (line1) P.push(para(line1, { size: 20, center: true }));
  if (line2) P.push(para(line2, { size: 20, center: true }));

  const render: Record<string, () => void> = {
    about: () => { if (v.aboutMe) { P.push(heading("About me")); P.push(para(v.aboutMe, { justify: true })); } },
    skills: () => {
      if (!v.skills.hard && !v.skills.soft) return;
      P.push(heading("Technical skills"));
      for (const [t, raw] of [["Hard skills", v.skills.hard], ["Soft skills", v.skills.soft]] as const) {
        const lines = skillLines(raw);
        if (!lines.length) continue;
        P.push(twoSide(t, "", { bold: true }));
        lines.forEach((l) => P.push(bulletRuns(l.label ? [run(`${l.label}: `, { bold: true }), ...runs(l.text)] : runs(l.text))));
      }
    },
    projects: () => {
      if (!v.projects.length) return;
      P.push(heading("Portfolio projects"));
      v.projects.forEach((p) => {
        const [name, ...tools] = p.header.split("|").map((x) => x.trim());
        P.push(twoSide(`${name}${tools.length ? ` [${tools.join(", ")}]` : ""}`, p.link ? `View Project: ${p.link}` : "", { bold: true }));
        p.bullets.forEach((x) => P.push(bullet(x)));
      });
    },
    experience: () => {
      if (!v.experience.length) return;
      P.push(heading("Professional experience"));
      for (const e of v.experience) {
        const [company, ...role] = e.header.split("|").map((x) => x.trim());
        P.push(twoSide(company, "", { bold: true }));
        P.push(twoSide(role.join(" | "), e.period, { italics: true }));
        e.bullets.forEach((x) => P.push(bullet(x)));
      }
    },
    education: () => {
      if (!v.education.length && !v.achievements.length) return;
      P.push(heading("Education & certifications"));
      for (const e of v.education) {
        const [school, ...rest] = e.line.split(" – ");
        P.push(twoSide(school, "", { bold: true }));
        P.push(twoSide(rest.join(" – "), e.years, { italics: true }));
        if (e.note) P.push(bullet(e.note));
      }
      v.achievements.forEach((a) => P.push(bullet(a.text + (a.link ? ` – ${a.link}` : ""))));
    },
  };
  for (const k of cv.sectionOrder) render[k]?.();

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1134, right: 1134 } } }, children: P }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
