import { skillLines, type CvView } from "@/lib/cv/view";
import type { CvStyle } from "@/lib/cv/style";
import { FONTS, type SectionKey } from "@/lib/cv/style";
import { Bullets, Row } from "./AtsSingle";

/** Template cột đôi: sidebar trái (liên hệ, skills, học vấn, chứng chỉ) · cột phải (about, experience, projects). */
export function TwoColumn({ v, style, order }: { v: CvView; style: CvStyle; order: SectionKey[] }) {
  const accent = style.accent;
  const side = { label: { fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.8, color: accent, margin: "16px 0 6px" } };

  const main: Partial<Record<SectionKey, React.ReactNode>> = {
    about: v.aboutMe ? <Block title="About me" accent={accent}><p style={{ margin: 0, textAlign: "justify" }}>{v.aboutMe}</p></Block> : null,
    experience: v.experience.length > 0 ? (
      <Block title="Work experience" accent={accent}>
        {v.experience.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}><Row left={e.header || "Công ty | Vị trí"} right={e.period} /><Bullets items={e.bullets} /></div>
        ))}
      </Block>
    ) : null,
    projects: v.projects.length > 0 ? (
      <Block title="Projects" accent={accent}>
        {v.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}><Row left={p.header || "Tên project | Tool"} right={p.link} /><Bullets items={p.bullets} /></div>
        ))}
      </Block>
    ) : null,
  };

  return (
    <div className="cv-page" style={{ width: 794, minHeight: 1123, display: "flex", boxSizing: "border-box",
      background: "#fff", color: "#111", fontFamily: FONTS[style.font].family, fontSize: 11, lineHeight: 1.35 }}>
      {/* Sidebar */}
      <aside style={{ width: 250, minHeight: 1123, padding: "48px 24px", boxSizing: "border-box", background: `${accent}14`, borderRight: `3px solid ${accent}` }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: accent, lineHeight: 1.15 }}>{v.basics.fullName.toUpperCase() || "HỌ VÀ TÊN"}</h1>
        <div style={{ fontWeight: 600, fontSize: 12, marginTop: 4 }}>{v.basics.headline || "Data Analyst"}</div>

        <div style={side.label}>Contact</div>
        {[v.basics.phone, v.basics.email, v.basics.linkedin, v.basics.github, v.basics.portfolioUrl, v.basics.location]
          .filter((s) => s.trim()).map((s, i) => <div key={i} style={{ fontSize: 10, marginBottom: 3, wordBreak: "break-all" }}>{s}</div>)}

        {(v.skills.hard || v.skills.soft) && (
          <>
            <div style={side.label}>Skills</div>
            {[["Hard skills", v.skills.hard], ["Soft skills", v.skills.soft]].map(([t, raw]) => skillLines(raw).length ? (
              <div key={t} style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5 }}>{t}</div>
                <ul style={{ margin: "1px 0 0", paddingLeft: 14, listStyle: "disc", fontSize: 10 }}>
                  {skillLines(raw).map((l, i) => <li key={i}>{l.label ? <><b>{l.label}:</b> {l.text}</> : l.text}</li>)}
                </ul>
              </div>
            ) : null)}
          </>
        )}
        {v.education.length > 0 && (
          <>
            <div style={side.label}>Education</div>
            {v.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}><b>{e.line}</b>{e.years && <div style={{ color: "#444", fontSize: 10 }}>{e.years}</div>}{e.note && <div style={{ color: "#444", fontSize: 10 }}>{e.note}</div>}</div>
            ))}
          </>
        )}
        {v.achievements.length > 0 && (
          <>
            <div style={side.label}>Certification</div>
            {v.achievements.map((a, i) => <div key={i} style={{ marginBottom: 4, fontSize: 10 }}>{a.text}{a.link ? ` – ${a.link}` : ""}</div>)}
          </>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "48px 36px", boxSizing: "border-box" }}>
        {order.map((k) => <div key={k}>{main[k]}</div>)}
      </main>
    </div>
  );
}

function Block({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: accent,
        borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>{title}</h2>
      {children}
    </section>
  );
}
