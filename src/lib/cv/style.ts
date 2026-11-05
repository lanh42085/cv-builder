/** Phong cách CV: template · font · màu nhấn. Dùng chung cho preview, PDF, DOCX. */

export type FontId = "times" | "be-vietnam-pro" | "inter" | "roboto" | "arial" | "georgia";
export type TemplateId = "ats-single" | "two-column";
export type CvSizes = { name: number; heading: number; body: number; section: number }; // pt
export type CvStyle = { font: FontId; bodyFont: FontId; accent: string; lineHeight: number; sizes: CvSizes };

export const FONTS: Record<FontId, { label: string; family: string; google?: string; docx: string }> = {
  times: { label: "Times New Roman (có chân)", family: '"Times New Roman", Times, serif', docx: "Times New Roman" },
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

export const DEFAULT_SIZES: CvSizes = { name: 15, heading: 10.5, body: 10, section: 10.5 };
export const DEFAULT_STYLE: CvStyle = { font: "times", bodyFont: "times", accent: "#111111", lineHeight: 1.25, sizes: { ...DEFAULT_SIZES } };
/** pt → px (96 dpi) để template dùng. */
export const pt = (v: number) => Math.round(v * 96 / 72 * 100) / 100;

export function normalizeStyle(s: unknown): CvStyle {
  const o = (s ?? {}) as Partial<CvStyle>;
  const font = (o.font && o.font in FONTS ? o.font : DEFAULT_STYLE.font) as FontId;
  const bodyFont = (o.bodyFont && o.bodyFont in FONTS ? o.bodyFont : font) as FontId;
  const accent = typeof o.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(o.accent) ? o.accent : DEFAULT_STYLE.accent;
  const lineHeight = typeof o.lineHeight === "number" && o.lineHeight >= 1 && o.lineHeight <= 2 ? o.lineHeight : DEFAULT_STYLE.lineHeight;
  const sz = (o.sizes ?? {}) as Partial<CvSizes>;
  const clamp = (v: unknown, d: number) => (typeof v === "number" && v >= 7 && v <= 30 ? v : d);
  return { font, bodyFont, accent, lineHeight, sizes: {
    name: clamp(sz.name, DEFAULT_SIZES.name), heading: clamp(sz.heading, DEFAULT_SIZES.heading),
    body: clamp(sz.body, DEFAULT_SIZES.body), section: clamp(sz.section, DEFAULT_SIZES.section) } };
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

/** Các mục của CV và thứ tự hiển thị. */
export type SectionKey = "about" | "skills" | "projects" | "experience" | "education";
export const SECTION_LABELS: Record<SectionKey, string> = {
  about: "About me", skills: "Technical skills", projects: "Portfolio projects",
  experience: "Professional experience", education: "Education & certifications",
};
export const DEFAULT_ORDER: SectionKey[] = ["about", "skills", "projects", "experience", "education"];

export function normalizeOrder(o: unknown): SectionKey[] {
  const arr = Array.isArray(o) ? (o as unknown[]).filter((k): k is SectionKey => typeof k === "string" && k in SECTION_LABELS) : [];
  const seen = new Set<SectionKey>();
  const out: SectionKey[] = [];
  for (const k of [...arr, ...DEFAULT_ORDER]) if (!seen.has(k)) { seen.add(k); out.push(k); }
  return out;
}
