import { AlignmentType, Document, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { CvData } from "./schema";
import { toView } from "./view";
import { FONTS } from "./style";

/** File Word 1 cột, không bảng, không cột — bản để nộp qua hệ thống ATS. */
export async function cvToDocx(cv: CvData): Promise<Buffer> {
  const v = toView(cv);
  const FONT = FONTS[cv.style.font].docx;
  const ACCENT = cv.style.accent.replace("#", "").toUpperCase();
  const RIGHT = 9638; // twips ~ lề phải A4 với margin 2cm
  const P: Paragraph[] = [];

  const heading = (text: string) => new Paragraph({
    spacing: { before: 220, after: 60 },
    border: { bottom: { style: "single", size: 6, color: ACCENT, space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: FONT, color: ACCENT })],
  });
  const row = (left: string, right: string, upper = false) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
    spacing: { before: 80, after: 10 },
    children: [new TextRun({ text: upper ? left.toUpperCase() : left, bold: true, size: 21, font: FONT }),
               new TextRun({ text: right ? `\t${right}` : "", italics: true, size: 21, font: FONT })],
  });
  const sub = (t: string) => new Paragraph({ spacing: { after: 10 }, children: [new TextRun({ text: t, italics: true, size: 21, font: FONT })] });
  const entry = (header: string, right: string, bullets: string[]) => {
    const [main, ...rest] = header.split("|").map((x) => x.trim());
    const out = [row(main || "—", right, true)];
    if (rest.length) out.push(sub(rest.join(" | ")));
    bullets.forEach((b) => out.push(bullet(b)));
    return out;
  };
  const bullet = (text: string) => new Paragraph({
    bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 20 },
    children: [new TextRun({ text, size: 21, font: FONT })],
  });
  const text = (t: string, opts: { bold?: boolean; size?: number; color?: string; justify?: boolean; center?: boolean } = {}) => new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : opts.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT, spacing: { after: 20 },
    children: [new TextRun({ text: t, bold: opts.bold, size: opts.size ?? 21, font: FONT, color: opts.color })],
  });

  const contact = [v.basics.phone, v.basics.email, v.basics.linkedin, v.basics.github, v.basics.portfolioUrl].filter((s) => s.trim()).join(" | ");
  P.push(text(v.basics.fullName.toUpperCase() || "HO VA TEN", { bold: true, size: 36, color: ACCENT }));
  P.push(text(v.basics.headline || "Data Analyst", { bold: true, size: 24 }));
  if (contact) P.push(text(contact, { size: 19, color: "555555" }));
  if (v.basics.location) P.push(text(v.basics.location, { size: 19, color: "555555" }));

  if (v.aboutMe) { P.push(heading("About me")); P.push(text(v.aboutMe, { justify: true })); }

  if (v.experience.length) {
    P.push(heading("Work experience"));
    for (const e of v.experience) P.push(...entry(e.header, e.period, e.bullets));
  }
  if (v.projects.length) {
    P.push(heading("Projects"));
    for (const p of v.projects) P.push(...entry(p.header, p.link, p.bullets));
  }
  if (v.skills.hard || v.skills.soft) {
    P.push(heading("Skills"));
    if (v.skills.hard) P.push(bullet(`Hard skills: ${v.skills.hard}`));
    if (v.skills.soft) P.push(bullet(`Soft skills: ${v.skills.soft}`));
  }
  if (v.education.length) {
    P.push(heading("Education"));
    for (const e of v.education) {
      const [school, ...rest] = e.line.split(" – ");
      P.push(row(school, e.years, true));
      if (rest.length) P.push(sub(rest.join(" – ")));
      if (e.note) P.push(text(e.note));
    }
  }
  if (v.achievements.length) {
    P.push(heading("Achievements & certification"));
    v.achievements.forEach((a) => P.push(bullet(a.text + (a.link ? ` – ${a.link}` : ""))));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children: P }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
