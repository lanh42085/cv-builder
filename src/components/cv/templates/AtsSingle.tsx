import { skillLines, type CvView } from "@/lib/cv/view";
import type { CvStyle } from "@/lib/cv/style";
import { Inline } from "@/components/cv/Inline";
import { FONTS, type SectionKey } from "@/lib/cv/style";

const LINK = "#1a56db";

/**
 * Template 1 cột chuẩn ATS, kiểu cổ điển: tên căn giữa, link xanh, tiêu đề mục in hoa gạch chân,
 * project đánh số có "View Project", công ty đậm + chức danh nghiêng + thời gian sát phải.
 * Thứ tự: About → Skills → Projects → Experience → Education & Certifications.
 * Kích thước cố định A4 (794×1123 px @96dpi). Dùng chung cho preview và PDF.
 */
export function AtsSingle({ v, style, order }: { v: CvView; style: CvStyle; order: SectionKey[] }) {
  const accent = style.accent;
  const b = v.basics;
  const line1 = [b.location, b.phone, b.email].map((s) => s.trim()).filter(Boolean);
  const hasLinks = b.linkedin.trim() || b.github.trim() || b.portfolioUrl.trim();

  const sections: Record<SectionKey, React.ReactNode> = {
    about: v.aboutMe ? <Section title="About me" accent={accent}><p style={{ margin: 0, textAlign: "justify" }}><Inline text={v.aboutMe} src={v.aboutSrc} /></p></Section> : null,
    skills: (v.skills.hard || v.skills.soft) ? (
      <Section title="Technical skills" accent={accent}>
        <SkillGroup title="Hard skills" raw={v.skills.hard} src="raw.skills.hard" />
        <SkillGroup title="Soft skills" raw={v.skills.soft} src="raw.skills.soft" />
      </Section>
    ) : null,
    projects: v.projects.length > 0 ? (
      <Section title="Portfolio projects" accent={accent}
        right={b.github.trim() ? <A href={b.github} bold>Github Overview</A> : undefined}>
        {v.projects.map((p, i) => {
          const [name, ...tools] = p.header.split("|").map((s) => s.trim());
          return (
            <div key={i} style={{ marginBottom: 6 }}>
              <TwoSide
                left={<b>{name || "Tên project"}{tools.length > 0 && ` [${tools.join(", ")}]`}</b>}
                right={p.link ? <A href={p.link} bold>View Project</A> : null} />
              <Bullets items={p.bullets} srcs={p.srcs} />
            </div>
          );
        })}
      </Section>
    ) : null,
    experience: v.experience.length > 0 ? (
      <Section title="Professional experience" accent={accent}>
        {v.experience.map((e, i) => {
          const [company, ...role] = e.header.split("|").map((s) => s.trim());
          return (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>{company || "Công ty"}</div>
              <TwoSide left={<i>{role.join(" | ")}</i>} right={e.period ? <i>{e.period}</i> : null} />
              <Bullets items={e.bullets} srcs={e.srcs} />
            </div>
          );
        })}
      </Section>
    ) : null,
    education: (v.education.length > 0 || v.achievements.length > 0) ? (
      <Section title="Education & certifications" accent={accent}>
        {v.education.map((e, i) => {
          const [school, ...rest] = e.line.split(" – ");
          return (
            <div key={i} style={{ marginBottom: 5 }}>
              <div style={{ fontWeight: 700 }}>{school}</div>
              <TwoSide left={<i>{rest.join(" – ")}</i>} right={e.years ? <i>{e.years}</i> : null} />
              {e.note && <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}><li><Inline text={e.note} src={e.noteSrc} /></li></ul>}
            </div>
          );
        })}
        {v.achievements.length > 0 && (
          <div style={{ marginTop: 3 }}>
            <b>Certifications:</b>{" "}
            {v.achievements.map((a, i) => (
              <span key={i}>
                <Inline text={a.text} src={a.src} />
                {a.link && <> (<A href={a.link}>link</A>)</>}
                {i < v.achievements.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </Section>
    ) : null,
  };

  return (
    <div className="cv-page" style={{ width: 794, minHeight: 1123, padding: "44px 52px", boxSizing: "border-box",
      background: "#fff", color: "#111", fontFamily: FONTS[style.font].family, fontSize: 11, lineHeight: 1.3 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: accent, letterSpacing: 0.3 }}>
          {b.fullName.toUpperCase() || "HỌ VÀ TÊN"}
        </h1>
        <div style={{ fontSize: 12, marginTop: 1 }}>{b.headline || "Data Analyst"}</div>
        {line1.length > 0 && (
          <div style={{ fontSize: 10.5, marginTop: 2 }}>
            {line1.map((s, i) => <span key={i}>{i > 0 && <Sep />}{s === b.email.trim() ? <A href={`mailto:${s}`}>{s}</A> : s}</span>)}
          </div>
        )}
        {hasLinks && (
          <div style={{ fontSize: 10.5 }}>
            {b.linkedin.trim() && <span>LinkedIn: <A href={b.linkedin}>{b.linkedin.trim()}</A></span>}
            {b.linkedin.trim() && b.github.trim() && <Sep />}
            {b.github.trim() && <span>GitHub: <A href={b.github}>{b.github.trim()}</A></span>}
            {(b.linkedin.trim() || b.github.trim()) && b.portfolioUrl.trim() && <Sep />}
            {b.portfolioUrl.trim() && <span>Portfolio: <A href={b.portfolioUrl}>{b.portfolioUrl.trim()}</A></span>}
          </div>
        )}
      </div>

      {order.map((k) => <div key={k}>{sections[k]}</div>)}
    </div>
  );
}

function SkillGroup({ title, raw, src }: { title: string; raw: string; src: string }) {
  const lines = skillLines(raw);
  if (lines.length === 0) return null;
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}>
        {lines.map((l, i) => <li key={i}>{l.label ? <><b>{l.label}:</b> <Inline text={l.text} src={`${src}@${i}`} /></> : <Inline text={l.text} src={`${src}@${i}`} />}</li>)}
      </ul>
    </div>
  );
}

function A({ href, children, bold }: { href: string; children: React.ReactNode; bold?: boolean }) {
  const url = /^https?:\/\//i.test(href) || href.startsWith("mailto:") ? href : `https://${href.trim()}`;
  return <a href={url} style={{ color: LINK, textDecoration: "underline", fontWeight: bold ? 700 : undefined }}>{children}</a>;
}
function Sep() { return <span style={{ color: "#666", margin: "0 6px" }}>|</span>; }

export function Section({ title, accent, right, children }: { title: string; accent: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
        borderBottom: `1.2px solid ${accent}`, paddingBottom: 1, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", color: accent }}>{title}</h2>
        {right && <span style={{ fontSize: 11 }}>{right}</span>}
      </div>
      {children}
    </section>
  );
}

function TwoSide({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <span>{left}</span>
      {right && <span style={{ whiteSpace: "nowrap" }}>{right}</span>}
    </div>
  );
}

export function Row({ left, right }: { left: string; right: string }) {
  return <TwoSide left={<b>{left}</b>} right={right || null} />;
}

export function Bullets({ items, srcs }: { items: string[]; srcs?: (string | null)[] }) {
  const xs = items.map((s, i) => ({ s, src: srcs?.[i] ?? null })).filter((x) => x.s && x.s.trim());
  if (xs.length === 0) return null;
  return (
    <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}>
      {xs.map((x, i) => <li key={i} style={{ marginBottom: 1, textAlign: "justify" }}><Inline text={x.s} src={x.src} /></li>)}
    </ul>
  );
}
