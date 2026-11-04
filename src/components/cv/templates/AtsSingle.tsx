import type { CvView } from "@/lib/cv/view";
import type { CvStyle } from "@/lib/cv/style";
import { FONTS } from "@/lib/cv/style";

/**
 * Template 1 cột, chuẩn ATS. Kích thước cố định A4 (794×1123 px @96dpi).
 * Dùng chung cho preview trong editor và khi xuất PDF.
 */
export function AtsSingle({ v, style }: { v: CvView; style: CvStyle }) {
  const accent = style.accent;
  const contact = [v.basics.phone, v.basics.email, v.basics.linkedin, v.basics.github, v.basics.portfolioUrl]
    .map((s) => s.trim()).filter(Boolean).join(" | ");

  return (
    <div className="cv-page" style={{ width: 794, minHeight: 1123, padding: "56px 60px", boxSizing: "border-box",
      background: "#fff", color: "#111", fontFamily: FONTS[style.font].family, fontSize: 11, lineHeight: 1.35 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: accent, letterSpacing: 0.5 }}>
        {v.basics.fullName.toUpperCase() || "HỌ VÀ TÊN"}
      </h1>
      <div style={{ fontWeight: 600, fontSize: 12 }}>{v.basics.headline || "Data Analyst"}</div>
      {contact && <div style={{ color: "#555", fontSize: 10, marginTop: 2 }}>{contact}</div>}
      {v.basics.location && <div style={{ color: "#555", fontSize: 10 }}>{v.basics.location}</div>}

      {v.aboutMe && <Section title="About me" accent={accent}><p style={{ margin: 0, textAlign: "justify" }}>{v.aboutMe}</p></Section>}

      {v.experience.length > 0 && (
        <Section title="Work experience" accent={accent}>
          {v.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}><Row left={e.header || "Công ty | Vị trí"} right={e.period} /><Bullets items={e.bullets} /></div>
          ))}
        </Section>
      )}
      {v.projects.length > 0 && (
        <Section title="Projects" accent={accent}>
          {v.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}><Row left={p.header || "Tên project | Tool"} right={p.link} /><Bullets items={p.bullets} /></div>
          ))}
        </Section>
      )}
      {(v.skills.hard || v.skills.soft) && (
        <Section title="Skills" accent={accent}>
          {v.skills.hard && <div><b>Hard skills:</b> {v.skills.hard}</div>}
          {v.skills.soft && <div><b>Soft skills:</b> {v.skills.soft}</div>}
        </Section>
      )}
      {v.education.length > 0 && (
        <Section title="Educational background" accent={accent}>
          {v.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 4 }}><Row left={e.line} right={e.years} />{e.note && <div style={{ color: "#444" }}>{e.note}</div>}</div>
          ))}
        </Section>
      )}
      {v.achievements.length > 0 && (
        <Section title="Achievements & certification" accent={accent}>
          <Bullets items={v.achievements.map((a) => a.text + (a.link ? ` – ${a.link}` : ""))} />
        </Section>
      )}
    </div>
  );
}

export function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 14 }}>
      <h2 style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6,
        color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 2 }}>{title}</h2>
      {children}
    </section>
  );
}

export function Row({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <b>{left}</b>
      {right && <span style={{ whiteSpace: "nowrap", color: "#333" }}>{right}</span>}
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  const xs = items.filter((s) => s && s.trim());
  if (xs.length === 0) return null;
  return (
    <ul style={{ margin: "3px 0 0", paddingLeft: 16 }}>
      {xs.map((b, i) => <li key={i} style={{ marginBottom: 2, textAlign: "justify" }}>{b}</li>)}
    </ul>
  );
}
