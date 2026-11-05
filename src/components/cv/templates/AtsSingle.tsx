import { skillLines, type CvView } from "@/lib/cv/view";
import type { CvStyle } from "@/lib/cv/style";
import { AddAfter, Inline, type EditApi } from "@/components/cv/Inline";
import { FONTS, PAGE, inch, pt, type SectionKey } from "@/lib/cv/style";

const LINK = "#1a56db";

/**
 * Template 1 cột chuẩn ATS, kiểu cổ điển: tên căn giữa, link xanh, tiêu đề mục in hoa gạch chân,
 * project đánh số có "View Project", công ty đậm + chức danh nghiêng + thời gian sát phải.
 * Thứ tự: About → Skills → Projects → Experience → Education & Certifications.
 * Kích thước cố định A4 (794×1123 px @96dpi). Dùng chung cho preview và PDF.
 */
export function AtsSingle({ v, style, order, edit }: { v: CvView; style: CvStyle; order: SectionKey[]; edit?: EditApi | null }) {
  const accent = style.accent;
  const b = v.basics;
  const headFont = FONTS[style.font].family, bodyFont = FONTS[style.bodyFont].family;
  const S = style.sizes, L = style.layout, PG = PAGE[L.format];
  const gap = { section: pt(L.gapSection), title: pt(L.gapTitle), block: pt(L.gapBlock), inner: pt(L.gapInner) };
  const line1 = [b.location, b.phone, b.email].map((s) => s.trim()).filter(Boolean);
  const hasLinks = b.linkedin.trim() || b.github.trim() || b.portfolioUrl.trim();

  const sections: Record<SectionKey, React.ReactNode> = {
    about: v.aboutMe ? <Section title="About me" accent={accent} size={pt(S.section)} font={headFont} gapSection={gap.section} gapTitle={gap.title}><p style={{ margin: 0, textAlign: "justify" }} data-block><Inline text={v.aboutMe} src={v.aboutSrc} edit={edit} /></p></Section> : null,
    skills: (v.skills.hard || v.skills.soft) ? (
      <Section title="Skills" accent={accent} size={pt(S.section)} font={headFont} gapSection={gap.section} gapTitle={gap.title}>
        <SkillGroup title="Hard skills" raw={v.skills.hard} src="raw.skills.hard" edit={edit} />
        <SkillGroup title="Soft skills" raw={v.skills.soft} src="raw.skills.soft" edit={edit} />
      </Section>
    ) : null,
    projects: v.projects.length > 0 ? (
      <Section title="Projects" accent={accent} size={pt(S.section)} font={headFont} gapSection={gap.section} gapTitle={gap.title}
        right={b.github.trim() ? <A href={b.github} bold>Github Overview</A> : undefined}>
        {v.projects.map((p, i) => {
          const [name, ...tools] = p.header.split("|").map((s) => s.trim());
          return (
            <div key={i} style={{ marginBottom: gap.block }}>
              <TwoSide block
                left={<b style={{ fontSize: pt(S.heading), fontFamily: headFont }}>{p.headerSrc && edit ? <Inline text={name} src={`${p.headerSrc}#0`} edit={edit} /> : (name || "Tên project")}{(tools.length > 0 || (p.headerSrc && edit)) && <> [{p.headerSrc && edit ? <Inline text={tools.join(", ")} src={`${p.headerSrc}#1`} edit={edit} /> : tools.join(", ")}]</>}</b>}
                right={p.link ? <A href={p.link} bold>View Project</A> : null} />
              <Bullets items={p.bullets} srcs={p.srcs} edit={edit} />
            </div>
          );
        })}
      </Section>
    ) : null,
    experience: v.experience.length > 0 ? (
      <Section title="Experience" accent={accent} size={pt(S.section)} font={headFont} gapSection={gap.section} gapTitle={gap.title}>
        {v.experience.map((e, i) => {
          const [company, ...role] = e.header.split("|").map((s) => s.trim());
          return (
            <div key={i} style={{ marginBottom: gap.block }}>
              <div style={{ fontWeight: 700, fontSize: pt(S.heading), fontFamily: headFont }} data-block>{e.headerSrc && edit ? <Inline text={company} src={`${e.headerSrc}#0`} edit={edit} /> : (company || "Công ty")}</div>
              <TwoSide block left={<i>{e.headerSrc && edit ? <Inline text={role.join(" | ")} src={`${e.headerSrc}#1`} edit={edit} /> : role.join(" | ")}</i>} right={e.period ? <i>{e.period}</i> : null} />
              <Bullets items={e.bullets} srcs={e.srcs} edit={edit} />
            </div>
          );
        })}
      </Section>
    ) : null,
    education: (v.education.length > 0 || v.achievements.length > 0) ? (
      <Section title="Education & certifications" accent={accent} size={pt(S.section)} font={headFont} gapSection={gap.section} gapTitle={gap.title}>
        {v.education.map((e, i) => {
          const [school, ...rest] = e.line.split(" – ");
          return (
            <div key={i} style={{ marginBottom: gap.block }}>
              <div style={{ fontWeight: 700, fontSize: pt(S.heading), fontFamily: headFont }} data-block>{school}</div>
              <TwoSide block left={<i>{rest.join(" – ")}</i>} right={e.years ? <i>{e.years}</i> : null} />
              {e.note && <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}><li data-block><Inline text={e.note} src={e.noteSrc} edit={edit} /></li></ul>}
            </div>
          );
        })}
        {v.achievements.length > 0 && (
          <div style={{ marginTop: 3 }} data-block>
            <b>Certifications:</b>{" "}
            {v.achievements.map((a, i) => (
              <span key={i}>
                <Inline text={a.text} src={a.src} edit={edit} />
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
    <div className="cv-page" style={{ width: PG.w, minHeight: PG.h, padding: `${inch(L.marginY)}px ${inch(L.marginX)}px`, boxSizing: "border-box",
      background: "#fff", color: "#111", fontFamily: bodyFont, fontSize: pt(S.body), lineHeight: style.lineHeight, ["--gap-inner" as string]: `${gap.inner}px` }}>
      <div style={{ textAlign: "center" }} data-block>
        <h1 style={{ margin: 0, fontSize: pt(S.name), fontWeight: 700, color: accent, letterSpacing: 0.3, fontFamily: headFont }}>
          {b.fullName.toUpperCase() || "HỌ VÀ TÊN"}
        </h1>
        <div style={{ fontSize: pt(S.heading), marginTop: 1 }}>{b.headline || "Data Analyst"}</div>
        {line1.length > 0 && (
          <div style={{ fontSize: pt(S.body), marginTop: 2 }}>
            {line1.map((s, i) => <span key={i}>{i > 0 && <Sep />}{s === b.email.trim() ? <A href={`mailto:${s}`}>{s}</A> : s}</span>)}
          </div>
        )}
        {hasLinks && (
          <div style={{ fontSize: pt(S.body) }}>
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

function SkillGroup({ title, raw, src, edit }: { title: string; raw: string; src: string; edit?: EditApi | null }) {
  const lines = skillLines(raw, Boolean(edit));
  if (lines.length === 0) return null;
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{ fontWeight: 700 }} data-block>{title}</div>
      <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}>
        {lines.map((l, i) => <li key={i} data-block className="group" style={{ position: "relative" }}>{l.label ? <><b>{l.label}:</b> <Inline text={l.text} src={`${src}@${i}`} edit={edit} /></> : <Inline text={l.text} src={`${src}@${i}`} edit={edit} />}<AddAfter path={`${src}@${i}`} edit={edit} /></li>)}
      </ul>
    </div>
  );
}

function A({ href, children, bold }: { href: string; children: React.ReactNode; bold?: boolean }) {
  const url = /^https?:\/\//i.test(href) || href.startsWith("mailto:") ? href : `https://${href.trim()}`;
  return <a href={url} style={{ color: LINK, textDecoration: "underline", fontWeight: bold ? 700 : undefined }}>{children}</a>;
}
function Sep() { return <span style={{ color: "#666", margin: "0 6px" }}>|</span>; }

export function Section({ title, accent, right, children, size = 14, font, gapSection = 10, gapTitle = 4 }: { title: string; accent: string; right?: React.ReactNode; children: React.ReactNode; size?: number; font?: string; gapSection?: number; gapTitle?: number }) {
  return (
    <section style={{ marginTop: gapSection }}>
      <div data-block style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
        borderBottom: `1.2px solid ${accent}`, paddingBottom: 1, marginBottom: gapTitle }}>
        <h2 style={{ margin: 0, fontSize: size, fontWeight: 700, textTransform: "uppercase", color: accent, fontFamily: font }}>{title}</h2>
        {right && <span>{right}</span>}
      </div>
      {children}
    </section>
  );
}

function TwoSide({ left, right, block }: { left: React.ReactNode; right: React.ReactNode; block?: boolean }) {
  return (
    <div data-block={block ? "" : undefined} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <span>{left}</span>
      {right && <span style={{ whiteSpace: "nowrap" }}>{right}</span>}
    </div>
  );
}

export function Row({ left, right }: { left: string; right: string }) {
  return <TwoSide left={<b>{left}</b>} right={right || null} />;
}

export function Bullets({ items, srcs, edit }: { items: string[]; srcs?: (string | null)[]; edit?: EditApi | null }) {
  const editing = Boolean(edit);
  const xs = items.map((s, i) => ({ s, src: srcs?.[i] ?? null })).filter((x) => (editing && x.src) || (x.s && x.s.trim()));
  if (xs.length === 0) return null;
  return (
    <ul style={{ margin: "1px 0 0", paddingLeft: 16, listStyle: "disc" }}>
      {xs.map((x, i) => <li key={i} data-block className="group" style={{ marginBottom: "var(--gap-inner, 1px)", textAlign: "justify", position: "relative" }}><Inline text={x.s} src={x.src} edit={edit} />{x.src && <AddAfter path={x.src} edit={edit} />}</li>)}
    </ul>
  );
}
