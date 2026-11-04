import type { CvView } from "@/lib/cv/view";
import type { CvStyle } from "@/lib/cv/style";
import { FONTS } from "@/lib/cv/style";

/**
 * Template 1 cột, chuẩn ATS, kiểu cổ điển: tên căn giữa, tiêu đề mục in hoa gạch chân mảnh,
 * tên công ty in hoa đậm, chức danh in nghiêng, thời gian sát lề phải.
 * Kích thước cố định A4 (794×1123 px @96dpi). Dùng chung cho preview và PDF.
 */
export function AtsSingle({ v, style }: { v: CvView; style: CvStyle }) {
  const accent = style.accent;
  const contact = [v.basics.location, v.basics.phone, v.basics.email, v.basics.linkedin, v.basics.github, v.basics.portfolioUrl]
    .map((s) => s.trim()).filter(Boolean).join(" | ");

  return (
    <div className="cv-page" style={{ width: 794, minHeight: 1123, padding: "48px 56px", boxSizing: "border-box",
      background: "#fff", color: "#111", fontFamily: FONTS[style.font].family, fontSize: 10.5, lineHeight: 1.3 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: accent, letterSpacing: 0.5 }}>
          {v.basics.fullName.toUpperCase() || "HỌ VÀ TÊN"}
        </h1>
        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 1 }}>{v.basics.headline || "Data Analyst"}</div>
        {contact && <div style={{ fontSize: 10, marginTop: 2 }}>{contact}</div>}
      </div>

      {v.aboutMe && <Section title="About me" accent={accent}><p style={{ margin: 0, textAlign: "justify" }}>{v.aboutMe}</p></Section>}

      {v.experience.length > 0 && (
        <Section title="Work experience" accent={accent}>
          {v.experience.map((e, i) => <Entry key={i} header={e.header} right={e.period} bullets={e.bullets} />)}
        </Section>
      )}

      {v.projects.length > 0 && (
        <Section title="Projects" accent={accent}>
          {v.projects.map((p, i) => <Entry key={i} header={p.header} right={p.link} bullets={p.bullets} />)}
        </Section>
      )}

      {(v.skills.hard || v.skills.soft) && (
        <Section title="Skills" accent={accent}>
          {v.skills.hard && <div><b>Hard skills:</b> {v.skills.hard}</div>}
          {v.skills.soft && <div><b>Soft skills:</b> {v.skills.soft}</div>}
        </Section>
      )}

      {v.education.length > 0 && (
        <Section title="Education" accent={accent}>
          {v.education.map((e, i) => {
            const [school, ...rest] = e.line.split(" – ");
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <TwoSide left={<b style={{ textTransform: "uppercase" }}>{school}</b>} right={e.years} />
                {rest.length > 0 && <div style={{ fontStyle: "italic" }}>{rest.join(" – ")}</div>}
                {e.note && <div>{e.note}</div>}
              </div>
            );
          })}
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

/** Mục có header dạng "Tên | Phụ" → dòng 1: TÊN in hoa đậm + bên phải; dòng 2: phụ in nghiêng. */
function Entry({ header, right, bullets }: { header: string; right: string; bullets: string[] }) {
  const [main, ...rest] = header.split("|").map((s) => s.trim());
  return (
    <div style={{ marginBottom: 7 }}>
      <TwoSide left={<b style={{ textTransform: "uppercase" }}>{main || "—"}</b>} right={right} />
      {rest.length > 0 && <div style={{ fontStyle: "italic" }}>{rest.join(" | ")}</div>}
      <Bullets items={bullets} />
    </div>
  );
}

export function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 11 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
        color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 1 }}>{title}</h2>
      {children}
    </section>
  );
}

function TwoSide({ left, right }: { left: React.ReactNode; right: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <span>{left}</span>
      {right && <span style={{ whiteSpace: "nowrap", fontStyle: "italic" }}>{right}</span>}
    </div>
  );
}

export function Row({ left, right }: { left: string; right: string }) {
  return <TwoSide left={<b>{left}</b>} right={right} />;
}

export function Bullets({ items }: { items: string[] }) {
  const xs = items.filter((s) => s && s.trim());
  if (xs.length === 0) return null;
  return (
    <ul style={{ margin: "2px 0 0", paddingLeft: 14 }}>
      {xs.map((b, i) => <li key={i} style={{ marginBottom: 1, textAlign: "justify" }}>{b}</li>)}
    </ul>
  );
}
