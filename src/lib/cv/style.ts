/** Phong cách CV: template · font · màu nhấn. Dùng chung cho preview, PDF, DOCX. */

export type FontId = "be-vietnam-pro" | "inter" | "roboto" | "arial" | "georgia";
export type TemplateId = "ats-single" | "two-column";
export type CvStyle = { font: FontId; accent: string };

export const FONTS: Record<FontId, { label: string; family: string; google?: string; docx: string }> = {
  "be-vietnam-pro": { label: "Be Vietnam Pro", family: '"Be Vietnam Pro", Arial, sans-serif', google: "Be+Vietnam+Pro:wght@400;600;700", docx: "Arial" },
  inter: { label: "Inter", family: 'Inter, Arial, sans-serif', google: "Inter:wght@400;600;700", docx: "Arial" },
  roboto: { label: "Roboto", family: 'Roboto, Arial, sans-serif', google: "Roboto:wght@400;500;700", docx: "Arial" },
  arial: { label: "Arial", family: 'Arial, Helvetica, sans-serif', docx: "Arial" },
  georgia: { label: "Georgia (có chân)", family: 'Georgia, "Times New Roman", serif', docx: "Georgia" },
};

export const TEMPLATES: Record<TemplateId, { label: string; hint: string }> = {
  "ats-single": { label: "1 cột — chuẩn ATS", hint: "An toàn nhất khi nộp qua hệ thống" },
  "two-column": { label: "Cột đôi — có sidebar", hint: "Nhìn đẹp hơn, gửi trực tiếp cho người" },
};

export const ACCENTS = ["#111111", "#1f4e79", "#0f766e", "#7c3aed", "#b91c1c", "#c2410c", "#374151", "#0369a1", "#15803d"];

export const DEFAULT_STYLE: CvStyle = { font: "be-vietnam-pro", accent: "#111111" };

export function normalizeStyle(s: unknown): CvStyle {
  const o = (s ?? {}) as Partial<CvStyle>;
  const font = (o.font && o.font in FONTS ? o.font : DEFAULT_STYLE.font) as FontId;
  const accent = typeof o.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(o.accent) ? o.accent : DEFAULT_STYLE.accent;
  return { font, accent };
}

/** Link Google Fonts cho font web (Arial/Georgia là font hệ thống, không cần). */
export function googleFontsHref(font: FontId): string | null {
  const g = FONTS[font].google;
  return g ? `https://fonts.googleapis.com/css2?family=${g}&display=swap` : null;
}

export function fontsHrefAll(): string {
  const fams = Object.values(FONTS).filter((f) => f.google).map((f) => `family=${f.google}`).join("&");
  return `https://fonts.googleapis.com/css2?${fams}&display=swap`;
}
