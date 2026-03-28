import type { CSSProperties } from "react";

import { HeroTypingLine } from "@/templates/neon-tech/components/hero-typing-line";
import styles from "@/templates/neon-tech/styles.module.css";
import type { SiteRenderData, TemplateRenderProps } from "@/templates/types";

function stringConfig(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberLabel(value: number) {
  return value.toString().padStart(2, "0");
}

function isAdminHref(href: string | undefined) {
  return typeof href === "string" && href.startsWith("/admin");
}

function revealClass(baseClass: string) {
  return `${baseClass} ${styles.reveal}`;
}

function revealStyle(index: number) {
  return {
    transitionDelay: `${index * 90}ms`,
  } satisfies CSSProperties;
}

function ProjectGlyph({ iconName }: { iconName?: string }) {
  if (iconName === "layout-dashboard") {
    return (
      <svg className={styles.projectGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3z" />
        <path d="M9 3v18" />
        <path d="M21 9H3" />
      </svg>
    );
  }

  if (iconName === "layers") {
    return (
      <svg className={styles.projectGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    );
  }

  if (iconName === "monitor") {
    return (
      <svg className={styles.projectGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="14" rx="2" ry="2" width="20" x="2" y="3" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    );
  }

  return (
    <svg className={styles.projectGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m12 3 2.6 5.26L20 9.03l-4 3.9.94 5.47L12 15.9l-4.94 2.5.94-5.47-4-3.9 5.4-.77L12 3Z" />
    </svg>
  );
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

  const glyph = icon.name ?? type;

  if (glyph === "mail" || glyph === "email") {
    return (
      <svg className={styles.contactGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }

  if (glyph === "github") {
    return (
      <svg className={styles.contactGlyph} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 0 0-3.8 23.39c.6.11.82-.25.82-.57v-2.16c-3.34.73-4.04-1.41-4.04-1.41-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.09-.74.09-.74 1.2.08 1.84 1.25 1.84 1.25 1.08 1.84 2.82 1.31 3.5 1 .1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.24 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.68.24 2.93.12 3.24.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.61-5.48 5.91.43.38.82 1.11.82 2.24v3.32c0 .32.21.69.82.57A12 12 0 0 0 12 0Z" />
      </svg>
    );
  }

  if (glyph === "book-open" || glyph === "book") {
    return (
      <svg className={styles.contactGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  return (
    <svg className={styles.contactGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10 14 21 3" />
      <path d="M15 3h6v6" />
      <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export default function TemplateEntry({ config, data }: TemplateRenderProps) {
  const accentColor = stringConfig(config.accentColor, "#22d3ee");
  const heroStyle = config.heroStyle === "stacked" ? "stacked" : "typing";
  const cardStyle = config.cardStyle === "flat" ? "flat" : "glow";
  const enableParticles = typeof config.enableParticles === "boolean" ? config.enableParticles : true;
  const particleDensity = typeof config.particleDensity === "number" ? config.particleDensity : 72;

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
  const featuredProjects = projects.filter((project) => project.isFeatured);
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

  const heroSummary = [
    data.site.subtitle,
    data.hero.titles[0],
    featuredProjects[0]?.title,
  ].find((value): value is string => typeof value === "string" && value.trim().length > 0);

  const rootStyle = {
    "--tpl-accent": accentColor,
  } as CSSProperties;

  return (
    <div className={styles.root} style={rootStyle}>
      {enableParticles ? (
        <canvas aria-hidden className={styles.particles} data-neon-particles="true" data-particle-density={String(particleDensity)} />
      ) : null}
      <div className={styles.shell}>
        {enabledSections.has("navigation") ? (
          <header className={styles.nav} data-neon-navbar="true">
            <div className={styles.brand}>
              <span className={styles.brandLabel}>Neon Tech</span>
              <strong className={styles.brandValue}>{data.site.title}</strong>
            </div>
            <nav className={styles.navLinks} aria-label="Primary">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  className={`${styles.navLink} ${item.href === "#home" ? styles.navLinkActive : ""}`}
                  data-neon-nav-link="true"
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
            <div className={styles.heroGrid}>
              <div className={styles.heroColumn}>
                <div className={styles.heroMeta}>
                  <span>{data.hero.greeting ?? "你好，我是"}</span>
                  {data.site.subtitle ? <span>{data.site.subtitle}</span> : null}
                </div>
                <h1 className={styles.heroTitle}>
                  {data.hero.name}
                  <span>
                    {heroStyle === "typing" ? (
                      <HeroTypingLine titles={data.hero.titles} />
                    ) : (
                      data.hero.titles.slice(0, 2).join(" · ")
                    )}
                  </span>
                </h1>
                {data.hero.description ? (
                  <p className={styles.heroDescription}>{data.hero.description}</p>
                ) : null}
                <div className={styles.heroActions}>
                  {heroPrimaryAction ? (
                    <a className={styles.heroButtonPrimary} href={heroPrimaryAction.href}>
                      {heroPrimaryAction.label}
                    </a>
                  ) : null}
                  {heroSecondaryAction ? (
                    <a className={styles.heroButtonSecondary} href={heroSecondaryAction.href}>
                      {heroSecondaryAction.label}
                    </a>
                  ) : null}
                </div>
              </div>

              <aside className={revealClass(styles.heroCard)} data-neon-reveal="true">
                {data.hero.avatar?.url ? (
                  <div className={styles.heroAvatar}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={data.hero.avatar.alt ?? data.hero.name} src={data.hero.avatar.url} />
                  </div>
                ) : null}
                <div className={styles.heroCardCaption}>
                  <span className={styles.eyebrow}>Current Focus</span>
                  <strong>{heroSummary ?? "Structured content and polished presentation."}</strong>
                  <p className={styles.sectionDescription}>
                    内容、模板和联系方式都来自同一份结构化数据，模板只负责把这些信息组织成更鲜明的视觉语言。
                  </p>
                </div>
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Projects</span>
                    <strong>{numberLabel(projects.length)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Skills</span>
                    <strong>{numberLabel(skills.reduce((sum, group) => sum + group.items.filter((item) => item.isEnabled).length, 0))}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Contacts</span>
                    <strong>{numberLabel(contacts.length)}</strong>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {enabledSections.has("skills") && skills.length > 0 ? (
          <section className={styles.section} id="skills">
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Skills</span>
              <h2 className={styles.sectionTitle}>聚焦技术栈与工作方式</h2>
              <p className={styles.sectionDescription}>用更紧凑的分组卡片组织技能，不展示冗余说明，让能力结构一眼可扫。</p>
            </div>
            <div className={styles.skillsGrid}>
              {skills.map((group, index) => (
                <article
                  key={group.id}
                  className={revealClass(styles.panel)}
                  data-neon-reveal="true"
                  style={revealStyle(index)}
                >
                  <span className={styles.eyebrow}>{group.subtitle ?? "Skill Cluster"}</span>
                  <h3 className={styles.panelTitle}>{group.title}</h3>
                  <div className={styles.skillItems}>
                    {group.items
                      .filter((item) => item.isEnabled)
                      .sort((left, right) => left.sortOrder - right.sortOrder)
                      .map((item) => (
                        <span key={item.id} className={styles.chip}>
                          {item.name}
                          {typeof item.level === "number" ? ` · ${item.level}` : ""}
                        </span>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {enabledSections.has("projects") && projects.length > 0 ? (
          <section className={styles.section} id="projects">
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Projects</span>
              <h2 className={styles.sectionTitle}>项目作品</h2>
              <p className={styles.sectionDescription}>保留封面、仓库、预览和推荐状态，用更强的卡片层次表达作品重量。</p>
            </div>
            <div className={styles.projectGrid}>
              {projects.map((project, index) => (
                <article
                  key={project.id}
                  className={`${revealClass(styles.projectCard)} ${cardStyle === "glow" ? styles.projectCardGlow : ""}`}
                  data-neon-project-card="true"
                  data-neon-reveal="true"
                  style={revealStyle(index)}
                >
                  {project.visual.type === "cover" && project.visual.cover?.url ? (
                    <div className={styles.projectCover}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={project.visual.cover.alt ?? project.title} src={project.visual.cover.url} />
                    </div>
                  ) : null}
                  <div className={styles.projectHeader}>
                    <span className={styles.projectIcon}>
                      <ProjectGlyph iconName={project.visual.iconName} />
                    </span>
                    {project.isFeatured ? <span className={styles.chip}>featured</span> : null}
                  </div>
                  <h3 className={styles.panelTitle}>{project.title}</h3>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.projectStack}>
                    {project.techStack.map((tech) => (
                      <span key={tech} className={styles.chip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className={styles.projectLinks}>
                    {project.previewUrl ? (
                      <a href={project.previewUrl} rel="noreferrer" target="_blank">
                        Preview
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a href={project.repoUrl} rel="noreferrer" target="_blank">
                        Repository
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {enabledSections.has("contact") && contacts.length > 0 ? (
          <section className={styles.section} id="contact">
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Contact</span>
              <h2 className={styles.sectionTitle}>联系我</h2>
              <p className={styles.sectionDescription}>把公开联系渠道整理成统一入口，方便合作、交流或继续了解更多内容。</p>
            </div>
            <div className={styles.contactGrid}>
              {contacts.map((contact, index) => {
                const cardContent = (
                  <>
                    <span className={styles.contactIcon}>
                      <ContactGlyph icon={contact.icon} type={contact.type} />
                    </span>
                    <div className={styles.contactCopy}>
                      <h3 className={styles.panelTitle}>{contact.label}</h3>
                      <p className={styles.contactValue}>{contact.value}</p>
                    </div>
                  </>
                );

                if (contact.href) {
                  return (
                    <a
                      key={contact.id}
                      className={revealClass(styles.contactCard)}
                      data-neon-reveal="true"
                      href={contact.href}
                      rel={contact.openInNewTab ? "noreferrer" : undefined}
                      style={revealStyle(index)}
                      target={contact.openInNewTab ? "_blank" : undefined}
                    >
                      {cardContent}
                    </a>
                  );
                }

                return (
                  <div
                    key={contact.id}
                    className={revealClass(styles.contactCard)}
                    data-neon-reveal="true"
                    style={revealStyle(index)}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {enabledSections.has("footer") ? (
          <footer className={styles.footer}>
            <p>{data.site.footerText}</p>
            {data.site.icp ? (
              <a href={data.site.icp.url} rel="noreferrer" target="_blank">
                {data.site.icp.text}
              </a>
            ) : null}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
