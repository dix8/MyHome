import type { CSSProperties } from "react";

import styles from "@/templates/glow-vision/styles.module.css";
import type { SiteRenderData, TemplateRenderProps } from "@/templates/types";

function stringConfig(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function numberConfig(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanConfig(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function isAdminHref(href: string | undefined) {
  return typeof href === "string" && href.startsWith("/admin");
}

function ProjectGlyph({ iconName }: { iconName?: string }) {
  if (iconName === "layout-dashboard") {
    return (
      <svg className={styles.projectIconGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3z" />
        <path d="M9 3v18" />
        <path d="M21 9H3" />
      </svg>
    );
  }

  if (iconName === "layers") {
    return (
      <svg className={styles.projectIconGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    );
  }

  if (iconName === "monitor") {
    return (
      <svg className={styles.projectIconGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="14" rx="2" ry="2" width="20" x="2" y="3" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    );
  }

  return (
    <svg className={styles.projectIconGlyph} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
      <img alt={icon.image.alt ?? type} className={styles.contactIconImage} src={icon.image.url} />
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

  if (glyph === "wechat" || glyph === "message-circle") {
    return (
      <svg className={styles.contactGlyph} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.69 2.19C3.89 2.19 0 5.48 0 9.53c0 2.21 1.17 4.2 3 5.55a.6.6 0 0 1 .22.66l-.4 1.48c-.02.07-.04.14-.04.21 0 .16.13.3.29.3a.35.35 0 0 0 .17-.06l1.9-1.11a.87.87 0 0 1 .72-.1c.9.26 1.86.4 2.84.4l.81-.05c-.86-2.58.16-4.97 1.93-6.45 1.7-1.42 3.88-1.98 5.85-1.84-.58-3.58-4.2-6.35-8.6-6.35Z" />
        <path d="M16.94 8.86c-1.8-.06-3.75.51-5.28 1.79-1.72 1.43-2.69 3.72-1.78 6.22.94 2.45 3.66 4.22 6.88 4.22.83 0 1.62-.11 2.36-.33a.73.73 0 0 1 .6.08l1.58.93a.27.27 0 0 0 .14.04c.13 0 .24-.11.24-.24 0-.06-.03-.12-.04-.18l-.33-1.24a.49.49 0 0 1 .18-.55C23.03 18.48 24 16.82 24 14.98c0-3.2-2.93-5.83-7.06-6.12Z" />
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

function revealClass(baseClass: string) {
  return `${baseClass} ${styles.reveal}`;
}

function revealStyle(index: number) {
  return {
    transitionDelay: `${index * 90}ms`,
  } satisfies CSSProperties;
}

function ProjectLinkIcon({
  kind,
}: {
  kind: "repo" | "preview";
}) {
  if (kind === "repo") {
    return (
      <svg className={styles.projectLinkIcon} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 0 0-3.8 23.39c.6.11.82-.25.82-.57v-2.16c-3.34.73-4.04-1.41-4.04-1.41-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.09-.74.09-.74 1.2.08 1.84 1.25 1.84 1.25 1.08 1.84 2.82 1.31 3.5 1 .1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.24 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.68.24 2.93.12 3.24.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.61-5.48 5.91.43.38.82 1.11.82 2.24v3.32c0 .32.21.69.82.57A12 12 0 0 0 12 0Z" />
      </svg>
    );
  }

  return (
    <svg className={styles.projectLinkIcon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export default function TemplateEntry({ config, data }: TemplateRenderProps) {
  const accentPrimary = stringConfig(config.accentPrimary, "#00f0ff");
  const accentSecondary = stringConfig(config.accentSecondary, "#7c3aed");
  const heroTitleMode = config.heroTitleMode === "static" ? "static" : "typing";
  const enableParticles = booleanConfig(config.enableParticles, true);
  const particleDensity = numberConfig(config.particleDensity, 80);

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

  const visibleSectionIds = data.sections
    .filter((section) => section.isEnabled)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((section) => (section.key === "hero" ? "home" : section.key));

  const heroIndex = visibleSectionIds.indexOf("home");
  const nextSectionId =
    heroIndex === -1
      ? "projects"
      : visibleSectionIds.slice(heroIndex + 1).find((sectionId) => sectionId !== "navigation" && sectionId !== "footer");
  const scrollTargetHref = `#${nextSectionId ?? "contact"}`;

  const rootStyle = {
    "--tpl-accent-primary": accentPrimary,
    "--tpl-accent-secondary": accentSecondary,
  } as CSSProperties;

  const heroPrimaryAction = data.hero.primaryAction;
  const heroSecondaryAction = isAdminHref(data.hero.secondaryAction?.href)
    ? hasContactSection
      ? {
          label: "联系我",
          href: "#contact",
        }
      : undefined
    : data.hero.secondaryAction;
  const footerText = data.site.footerText || `© ${new Date().getFullYear()} ${data.site.title}. All rights reserved.`;

  return (
    <div className={styles.root} style={rootStyle}>
      {enableParticles ? (
        <canvas
          aria-hidden
          className={styles.particles}
          data-particle-density={String(particleDensity)}
          data-tpl-particles="true"
        />
      ) : null}

      {enabledSections.has("navigation") ? (
        <nav className={styles.navbar} data-tpl-navbar="true">
          <a className={styles.navLogo} href="#home">
            <span className={styles.logoBracket}>&lt;</span>
            <span className={styles.logoSpacer} aria-hidden>
              {" "}
            </span>
            <span className={styles.logoText}>{data.site.title}</span>
            <span className={styles.logoSpacer} aria-hidden>
              {" "}
            </span>
            <span className={styles.logoBracket}>/&gt;</span>
          </a>

          <ul className={styles.navLinks} data-tpl-nav-links="true">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  className={`${styles.navLink} ${item.href === "#home" ? styles.navLinkActive : ""}`}
                  data-tpl-nav-link="true"
                  href={item.href}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  target={item.openInNewTab ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <button aria-label="切换菜单" className={styles.navToggle} data-tpl-nav-toggle="true" type="button">
            <span />
            <span />
            <span />
          </button>
        </nav>
      ) : null}

      {enabledSections.has("hero") ? (
        <section className={styles.hero} id="home">
          <div className={styles.heroContent}>
            {data.hero.avatar?.url ? (
              <div className={styles.heroAvatar}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={data.hero.avatar.alt ?? data.hero.name} src={data.hero.avatar.url} />
              </div>
            ) : null}
            <p className={styles.heroGreeting}>{data.hero.greeting ?? "你好，我是"}</p>
            <h1 className={styles.heroName}>{data.hero.name}</h1>
            <div className={styles.heroTitle}>
              <span className={styles.typingPrefix}>&gt;&nbsp;</span>
              {heroTitleMode === "typing" ? (
                <>
                  <span
                    className={styles.typingText}
                    data-titles={JSON.stringify(data.hero.titles)}
                    data-tpl-typing-text="true"
                  >
                    {data.hero.titles[0] ?? ""}
                  </span>
                  <span aria-hidden className={styles.typingCursor}>
                    |
                  </span>
                </>
              ) : (
                <span className={styles.typingText}>{data.hero.titles.slice(0, 2).join(" · ")}</span>
              )}
            </div>
            {data.hero.description ? <p className={styles.heroDescription}>{data.hero.description}</p> : null}
            <div className={styles.heroActions}>
              {heroPrimaryAction ? (
                <a className={`${styles.button} ${styles.buttonPrimary}`} href={heroPrimaryAction.href}>
                  {heroPrimaryAction.label}
                </a>
              ) : null}
              {heroSecondaryAction ? (
                <a className={`${styles.button} ${styles.buttonOutline}`} href={heroSecondaryAction.href}>
                  {heroSecondaryAction.label}
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.scrollIndicator}>
            <a aria-label="滚动到下一部分" className={styles.scrollArrow} href={scrollTargetHref} />
          </div>
        </section>
      ) : null}

      {enabledSections.has("skills") && skills.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionAlt}`} id="skills">
          <div className={styles.container}>
            <h2 className={revealClass(styles.sectionTitle)} data-reveal="true">
              <span className={styles.titleDecorator} /> 技能栈
            </h2>
            <div className={styles.skillsGrid}>
              {skills.map((group) => (
                <article
                  key={group.id}
                  className={revealClass(styles.skillCategory)}
                  data-reveal="true"
                  style={revealStyle(group.sortOrder)}
                >
                  <h3 className={styles.skillCategoryTitle}>{group.title}</h3>
                  <div className={styles.skillTags}>
                    {group.items
                      .filter((item) => item.isEnabled)
                      .sort((left, right) => left.sortOrder - right.sortOrder)
                      .map((item) => (
                        <span
                          key={item.id}
                          className={styles.skillTag}
                          data-level={typeof item.level === "number" ? String(item.level) : undefined}
                        >
                          {item.name}
                        </span>
                      ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {enabledSections.has("projects") && projects.length > 0 ? (
        <section className={styles.section} id="projects">
          <div className={styles.container}>
            <h2 className={revealClass(styles.sectionTitle)} data-reveal="true">
              <span className={styles.titleDecorator} /> 项目经历
            </h2>
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <article
                  key={project.id}
                  className={revealClass(styles.projectCard)}
                  data-reveal="true"
                  data-tpl-project-card="true"
                  style={revealStyle(project.sortOrder)}
                >
                  {project.visual.type === "cover" && project.visual.cover?.url ? (
                    <div className={styles.projectCover}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={project.visual.cover.alt ?? project.title} src={project.visual.cover.url} />
                    </div>
                  ) : null}

                  <div className={styles.projectHeader}>
                    <div className={styles.projectIcon}>
                      <ProjectGlyph iconName={project.visual.iconName} />
                    </div>
                    <div className={styles.projectLinks}>
                      {project.repoUrl ? (
                        <a
                          aria-label="查看 GitHub"
                          className={styles.projectLink}
                          href={project.repoUrl}
                          rel="noreferrer"
                          target="_blank"
                          title="GitHub"
                        >
                          <ProjectLinkIcon kind="repo" />
                        </a>
                      ) : null}
                      {project.previewUrl ? (
                        <a
                          aria-label="查看在线预览"
                          className={styles.projectLink}
                          href={project.previewUrl}
                          rel="noreferrer"
                          target="_blank"
                          title="在线预览"
                        >
                          <ProjectLinkIcon kind="preview" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.projectTech}>
                    {project.techStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {enabledSections.has("contact") && contacts.length > 0 ? (
        <section className={`${styles.section} ${styles.sectionAlt}`} id="contact">
          <div className={styles.container}>
            <h2 className={revealClass(styles.sectionTitle)} data-reveal="true">
              <span className={styles.titleDecorator} /> 联系我
            </h2>
            <p className={revealClass(styles.contactSubtitle)} data-reveal="true">
              如果你有任何问题或合作意向，欢迎随时联系我。
            </p>
            <div className={styles.contactGrid}>
              {contacts.map((contact) => {
                const cardContent = (
                  <>
                    <div className={styles.contactIcon}>
                      <ContactGlyph icon={contact.icon} type={contact.type} />
                    </div>
                    <span className={styles.contactLabel}>{contact.label}</span>
                    <span className={styles.contactValue}>{contact.value}</span>
                  </>
                );

                if (contact.href) {
                  return (
                    <a
                      key={contact.id}
                      className={revealClass(styles.contactCard)}
                      data-reveal="true"
                      href={contact.href}
                      rel={contact.openInNewTab ? "noreferrer" : undefined}
                      style={revealStyle(contact.sortOrder)}
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
                    data-reveal="true"
                    style={revealStyle(contact.sortOrder)}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {enabledSections.has("footer") ? (
        <footer className={styles.footer}>
          <div className={styles.footerLine} />
          <div className={styles.footerContent}>
            <p className={styles.footerCopyright}>{footerText}</p>
            {data.site.icp ? (
              <p className={styles.footerIcp}>
                <a href={data.site.icp.url} rel="noreferrer" target="_blank">
                  {data.site.icp.text}
                </a>
              </p>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
