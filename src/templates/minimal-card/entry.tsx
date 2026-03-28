import type { CSSProperties } from "react";

import styles from "@/templates/minimal-card/styles.module.css";
import type { SiteRenderData, TemplateRenderProps } from "@/templates/types";

function stringConfig(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function isAdminHref(href: string | undefined) {
  return typeof href === "string" && href.startsWith("/admin");
}

function revealClass(baseClass: string) {
  return `${baseClass} ${styles.reveal}`;
}

function revealStyle(index: number) {
  return {
    transitionDelay: `${index * 70}ms`,
  } satisfies CSSProperties;
}

function ContactGlyph({
  icon,
  type,
}: {
  icon: SiteRenderData["contacts"][number]["icon"];
  type: string;
}) {
  if (icon.type === "image" && icon.image?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={icon.image.alt ?? type} className={styles.contactImage} src={icon.image.url} />
    );
  }

  const glyph = (icon.name ?? type).toLowerCase();

  if (glyph.includes("mail") || glyph.includes("email")) {
    return "✉";
  }

  if (glyph.includes("github")) {
    return "GH";
  }

  if (glyph.includes("book")) {
    return "BK";
  }

  if (glyph.includes("wechat")) {
    return "WX";
  }

  return glyph.slice(0, 2).toUpperCase();
}

export default function TemplateEntry({ config, data }: TemplateRenderProps) {
  const surfaceTone = config.surfaceTone === "graphite" ? "graphite" : "linen";
  const layoutDensity = config.layoutDensity === "compact" ? "compact" : "airy";
  const accentColor = stringConfig(config.accentColor, "#0f766e");
  const rootStyle = {
    "--tpl-accent": accentColor,
  } as CSSProperties;

  const enabledSections = new Set(data.sections.filter((section) => section.isEnabled).map((section) => section.key));
  const navigationItems = data.navigation
    .filter((item) => item.isEnabled)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const skills = data.skills
    .filter((group) => group.isEnabled)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const projects = data.projects
    .filter((project) => project.isEnabled)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const contacts = data.contacts
    .filter((contact) => contact.isEnabled)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const hasContactSection = enabledSections.has("contact") && contacts.length > 0;
  const heroPrimaryAction = data.hero.primaryAction;
  const heroSecondaryAction = isAdminHref(data.hero.secondaryAction?.href)
    ? hasContactSection
      ? {
          label: "联系我",
          href: "#contact",
        }
      : undefined
    : data.hero.secondaryAction;

  const titleLine = data.hero.titles.filter((title) => title.trim().length > 0).slice(0, 3);

  return (
    <div
      className={`${styles.root} ${surfaceTone === "graphite" ? styles.graphite : ""} ${
        layoutDensity === "compact" ? styles.compact : ""
      }`}
      style={rootStyle}
    >
      <div className={styles.shell}>
        {enabledSections.has("navigation") ? (
          <header className={styles.nav} data-minimal-nav="true">
            <strong className={styles.brand}>{data.site.title}</strong>
            <nav className={styles.navLinks}>
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  className={`${styles.navLink} ${item.href === "#home" ? styles.navLinkActive : ""}`}
                  data-minimal-nav-link="true"
                  href={item.href}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  target={item.openInNewTab ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>
        ) : null}

        {enabledSections.has("hero") ? (
          <section id="home" className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Minimal Editorial</span>
              <p className={styles.heroGreeting}>{data.hero.greeting ?? "你好，我是"}</p>
              <h1 className={styles.heroTitle}>{data.hero.name}</h1>
              {titleLine.length > 0 ? (
                <div className={styles.titleRow}>
                  {titleLine.map((title) => (
                    <span key={title} className={styles.titleChip}>
                      {title}
                    </span>
                  ))}
                </div>
              ) : null}
              {data.hero.description ? <p className={styles.description}>{data.hero.description}</p> : null}
              <div className={styles.ctaRow}>
                {heroPrimaryAction ? (
                  <a className={styles.primaryCta} href={heroPrimaryAction.href}>
                    {heroPrimaryAction.label}
                  </a>
                ) : null}
                {heroSecondaryAction ? (
                  <a className={styles.secondaryCta} href={heroSecondaryAction.href}>
                    {heroSecondaryAction.label}
                  </a>
                ) : null}
              </div>
            </div>

            <aside className={revealClass(styles.profileCard)} data-minimal-reveal="true">
              {data.hero.avatar?.url ? (
                <div className={styles.profileMedia}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={data.hero.avatar.alt ?? data.hero.name} src={data.hero.avatar.url} />
                </div>
              ) : null}
              <div className={styles.profileMeta}>
                <span className={styles.eyebrow}>Overview</span>
                <p>{data.site.subtitle ?? data.hero.titles[0] ?? "Independent builder and writer."}</p>
              </div>
            </aside>
          </section>
        ) : null}

        {enabledSections.has("skills") && skills.length > 0 ? (
          <section id="skills" className={styles.section}>
            <div className={styles.stack}>
              <span className={styles.eyebrow}>Skills</span>
              <h2 className={styles.sectionTitle}>模块化技能分组</h2>
              <p className={styles.muted}>以更克制的卡片和标签组织技能信息，阅读节奏比科技风模板更平静。</p>
            </div>
            <div className={styles.cardGrid}>
              {skills.map((group, index) => (
                <article
                  key={group.id}
                  className={revealClass(styles.card)}
                  data-minimal-reveal="true"
                  style={revealStyle(index)}
                >
                  <h3 className={styles.cardTitle}>{group.title}</h3>
                  {group.subtitle ? <p className={`${styles.muted} ${styles.cardIntro}`}>{group.subtitle}</p> : null}
                  <div className={styles.chipRow}>
                    {group.items
                      .filter((item) => item.isEnabled)
                      .sort((left, right) => left.sortOrder - right.sortOrder)
                      .map((item) => (
                        <span key={item.id} className={styles.chip}>
                          {item.name}
                        </span>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {enabledSections.has("projects") && projects.length > 0 ? (
          <section id="projects" className={styles.section}>
            <div className={styles.stack}>
              <span className={styles.eyebrow}>Projects</span>
              <h2 className={styles.sectionTitle}>项目内容与展示解耦</h2>
              <p className={styles.muted}>保留作品摘要、技术栈和链接入口，用更偏编辑设计的版式承载案例信息。</p>
            </div>
            <div className={styles.cardGrid}>
              {projects.map((project, index) => (
                <article
                  key={project.id}
                  className={revealClass(styles.card)}
                  data-minimal-reveal="true"
                  style={revealStyle(index)}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                    {project.isFeatured ? <span className={styles.featuredBadge}>精选</span> : null}
                  </div>
                  <p className={`${styles.muted} ${styles.cardDescription}`}>{project.description}</p>
                  <div className={styles.chipRow}>
                    {project.techStack.map((tech) => (
                      <span key={tech} className={styles.chip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className={styles.linkRow}>
                    {project.previewUrl ? (
                      <a href={project.previewUrl} rel="noreferrer" target="_blank">
                        在线预览
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a href={project.repoUrl} rel="noreferrer" target="_blank">
                        仓库地址
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {enabledSections.has("contact") && contacts.length > 0 ? (
          <section id="contact" className={styles.section}>
            <div className={styles.stack}>
              <span className={styles.eyebrow}>Contact</span>
              <h2 className={styles.sectionTitle}>联系方式保持结构化</h2>
              <p className={styles.muted}>在简约风格下仍然保留统一入口和外链能力，适合更成熟、克制的个人主页表达。</p>
            </div>
            <div className={styles.contactGrid}>
              {contacts.map((contact, index) => {
                const content = (
                  <>
                    <span className={styles.contactBadge}>
                      <ContactGlyph icon={contact.icon} type={contact.type} />
                    </span>
                    <div className={styles.contactCopy}>
                      <h3 className={styles.cardTitle}>{contact.label}</h3>
                      <p className={styles.muted}>{contact.value}</p>
                    </div>
                  </>
                );

                if (contact.href) {
                  return (
                    <a
                      key={contact.id}
                      className={revealClass(styles.contactCard)}
                      data-minimal-reveal="true"
                      href={contact.href}
                      rel={contact.openInNewTab ? "noreferrer" : undefined}
                      style={revealStyle(index)}
                      target={contact.openInNewTab ? "_blank" : undefined}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={contact.id}
                    className={revealClass(styles.contactCard)}
                    data-minimal-reveal="true"
                    style={revealStyle(index)}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {enabledSections.has("footer") ? (
          <footer className={styles.footer}>
            <p className={styles.muted}>{data.site.footerText}</p>
            {data.site.icp ? (
              <a className={styles.footerLink} href={data.site.icp.url} rel="noreferrer" target="_blank">
                {data.site.icp.text}
              </a>
            ) : null}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
