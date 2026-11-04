import { AlignmentType, Document, Packer, Paragraph, TabStopType, TextRun } from "docx";
import type { CvData } from "./schema";
import { toView } from "./view";

/** File Word 1 cột, không bảng, không cột — bản để nộp qua hệ thống ATS. */
export async function cvToDocx(cv: CvData): Promise<Buffer> {
  const v = toView(cv);
  const FONT = "Arial";
  const RIGHT = 9638; // twips ~ lề phải A4 với margin 2cm
  const P: Paragraph[] = [];

  const heading = (text: string) => new Paragraph({
    spacing: { before: 220, after: 60 },
    border: { bottom: { style: "single", size: 6, color: "1F4E79", space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: FONT, color: "1F4E79" })],
  });
  const row = (left: string, right: string) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
    spacing: { before: 80, after: 20 },
    children: [new TextRun({ text: left, bold: true, size: 21, font: FONT }), new TextRun({ text: right ? `\t${right}` : "", size: 21, font: FONT })],
  });
  const bullet = (text: string) => new Paragraph({
    bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 20 },
    children: [new TextRun({ text, size: 21, font: FONT })],
  });
  const text = (t: string, opts: { bold?: boolean; size?: number; color?: string; justify?: boolean } = {}) => new Paragraph({
    alignment: opts.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT, spacing: { after: 20 },
    children: [new TextRun({ text: t, bold: opts.bold, size: opts.size ?? 21, font: FONT, color: opts.color })],
  });

  const contact = [v.basics.phone, v.basics.email, v.basics.linkedin, v.basics.github, v.basics.portfolioUrl].filter((s) => s.trim()).join(" | ");
  P.push(text(v.basics.fullName.toUpperCase() || "HO VA TEN", { bold: true, size: 36, color: "1F4E79" }));
  P.push(text(v.basics.headline || "Data Analyst", { bold: true, size: 24 }));
  if (contact) P.push(text(contact, { size: 19, color: "555555" }));
  if (v.basics.location) P.push(text(v.basics.location, { size: 19, color: "555555" }));

  if (v.aboutMe) { P.push(heading("About me")); P.push(text(v.aboutMe, { justify: true })); }

  if (v.experience.length) {
    P.push(heading("Work experience"));
    for (const e of v.experience) { P.push(row(e.header, e.period)); e.bullets.forEach((b) => P.push(bullet(b))); }
  }
  if (v.projects.length) {
    P.push(heading("Projects"));
    for (const p of v.projects) { P.push(row(p.header, p.link)); p.bullets.forEach((b) => P.push(bullet(b))); }
  }
  if (v.skills.hard || v.skills.soft) {
    P.push(heading("Skills"));
    if (v.skills.hard) P.push(bullet(`Hard skills: ${v.skills.hard}`));
    if (v.skills.soft) P.push(bullet(`Soft skills: ${v.skills.soft}`));
  }
  if (v.education.length) {
    P.push(heading("Educational background"));
    for (const e of v.education) { P.push(row(e.line, e.years)); if (e.note) P.push(text(e.note)); }
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
