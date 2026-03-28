import type { CSSProperties } from "react";

import styles from "@/templates/signal-grid/styles.module.css";
import type { TemplateRenderProps } from "@/templates/types";

function stringConfig(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function booleanConfig(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function isAdminHref(href: string | undefined) {
  return typeof href === "string" && href.startsWith("/admin");
}

function revealClass(baseClass: string) {
  return `${baseClass} ${styles.reveal}`;
}

function revealStyle(index: number) {
  return {
    transitionDelay: `${index * 80}ms`,
  } satisfies CSSProperties;
}

export default function TemplateEntry({ config, data }: TemplateRenderProps) {
  const primaryColor = stringConfig(config.primaryColor, "#6ee7ff");
  const secondaryColor = stringConfig(config.secondaryColor, "#ff8a5b");
  const frameGlow = booleanConfig(config.frameGlow, true);

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

  const rootStyle = {
    "--tpl-primary": primaryColor,
    "--tpl-secondary": secondaryColor,
  } as CSSProperties;

  const footerText = data.site.footerText || `© ${new Date().getFullYear()} ${data.site.title}.`;
  const titleLine = data.hero.titles.filter((item) => item.trim().length > 0).slice(0, 3).join(" / ");

  return (
    <div className={`${styles.root} ${frameGlow ? styles.frameGlow : ""}`} style={rootStyle}>
      <div className={styles.gridBackdrop} />
      <div className={styles.shell}>
        {enabledSections.has("navigation") ? (
          <header className={styles.nav} data-signal-nav="true">
            <div className={styles.brand}>
              <span className={styles.brandLabel}>Signal Grid</span>
              <strong className={styles.brandValue}>{data.site.title}</strong>
            </div>
            <nav className={styles.navLinks}>
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  className={`${styles.navLink} ${item.href === "#home" ? styles.navLinkActive : ""}`}
                  data-signal-nav-link="true"
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
            <div className={styles.heroLead}>
              <span className={styles.kicker}>System Ready</span>
              <p className={styles.heroGreeting}>{data.hero.greeting ?? "你好，我是"}</p>
              <h1 className={styles.heroTitle}>{data.hero.name}</h1>
              {titleLine ? <p className={styles.heroSubtitle}>{titleLine}</p> : null}
              {data.hero.description ? <p className={styles.heroDescription}>{data.hero.description}</p> : null}
              <div className={styles.heroActions}>
                {heroPrimaryAction ? (
                  <a className={styles.primaryAction} href={heroPrimaryAction.href}>
                    {heroPrimaryAction.label}
                  </a>
                ) : null}
                {heroSecondaryAction ? (
                  <a className={styles.secondaryAction} href={heroSecondaryAction.href}>
                    {heroSecondaryAction.label}
                  </a>
                ) : null}
              </div>
            </div>

            <div className={styles.heroAside}>
              <article className={revealClass(styles.heroPanel)} data-signal-panel="true" data-signal-reveal="true">
                <span className={styles.panelLabel}>identity</span>
                {data.hero.avatar?.url ? (
                  <div className={styles.heroAvatar}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={data.hero.avatar.alt ?? data.hero.name} src={data.hero.avatar.url} />
                  </div>
                ) : null}
                <div className={styles.panelBody}>
                  <strong>{data.site.subtitle ?? "Personal operations console."}</strong>
                  <p>以状态面板、网格骨架和系统感层次组织个人主页内容。</p>
                </div>
              </article>

              <article className={revealClass(styles.metricPanel)} data-signal-panel="true" data-signal-reveal="true" style={revealStyle(1)}>
                <span className={styles.panelLabel}>stats</span>
                <div className={styles.metricGrid}>
                  <div>
                    <span>Projects</span>
                    <strong>{projects.length.toString().padStart(2, "0")}</strong>
                  </div>
                  <div>
                    <span>Skills</span>
                    <strong>{skills.length.toString().padStart(2, "0")}</strong>
                  </div>
                  <div>
                    <span>Contacts</span>
                    <strong>{contacts.length.toString().padStart(2, "0")}</strong>
                  </div>
                </div>
              </article>
            </div>
          </section>
        ) : null}

        {enabledSections.has("skills") && skills.length > 0 ? (
          <section id="skills" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.kicker}>Skill Matrix</span>
              <h2 className={styles.sectionTitle}>能力维度</h2>
            </div>
            <div className={styles.skillGrid}>
              {skills.map((group, index) => (
                <article
                  key={group.id}
                  className={revealClass(styles.skillPanel)}
                  data-signal-panel="true"
                  data-signal-reveal="true"
                  style={revealStyle(index)}
                >
                  <span className={styles.panelLabel}>{group.subtitle ?? "cluster"}</span>
                  <h3>{group.title}</h3>
                  <div className={styles.skillList}>
                    {group.items
                      .filter((item) => item.isEnabled)
                      .sort((left, right) => left.sortOrder - right.sortOrder)
                      .map((item) => (
                        <span key={item.id} className={styles.skillChip}>
                          {item.name}
                          {typeof item.level === "number" ? ` / ${item.level}` : ""}
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
            <div className={styles.sectionHeader}>
              <span className={styles.kicker}>Project Archive</span>
              <h2 className={styles.sectionTitle}>作品记录</h2>
            </div>
            <div className={styles.projectList}>
              {projects.map((project, index) => (
                <article
                  key={project.id}
                  className={revealClass(styles.projectPanel)}
                  data-signal-panel="true"
                  data-signal-reveal="true"
                  style={revealStyle(index)}
                >
                  <div className={styles.projectMeta}>
                    <span className={styles.panelLabel}>{project.isFeatured ? "featured" : "project"}</span>
                    <div className={styles.projectLinks}>
                      {project.previewUrl ? (
                        <a href={project.previewUrl} rel="noreferrer" target="_blank">
                          Preview
                        </a>
                      ) : null}
                      {project.repoUrl ? (
                        <a href={project.repoUrl} rel="noreferrer" target="_blank">
                          Repo
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.projectContent}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className={styles.projectStack}>
                      {project.techStack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {enabledSections.has("contact") && contacts.length > 0 ? (
          <section id="contact" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.kicker}>Open Channels</span>
              <h2 className={styles.sectionTitle}>联系入口</h2>
            </div>
            <div className={styles.contactBoard}>
              {contacts.map((contact, index) => {
                const content = (
                  <>
                    <span className={styles.panelLabel}>{contact.type}</span>
                    <strong>{contact.label}</strong>
                    <p>{contact.value}</p>
                  </>
                );

                if (contact.href) {
                  return (
                    <a
                      key={contact.id}
                      className={revealClass(styles.contactPanel)}
                      data-signal-panel="true"
                      data-signal-reveal="true"
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
                    className={revealClass(styles.contactPanel)}
                    data-signal-panel="true"
                    data-signal-reveal="true"
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
            <p>{footerText}</p>
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
