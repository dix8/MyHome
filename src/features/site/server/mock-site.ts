import type { SiteThemeState } from "@/shared/types/site-theme-state";
import type { SiteRenderData } from "@/templates/types";

export const mockSiteRenderData: SiteRenderData = {
  site: {
    title: "Kek's Workspace",
    subtitle: "Engineer, builder, and experimentalist.",
    seoTitle: "Kek's Workspace",
    seoDescription: "A template-driven personal homepage system with live admin previews.",
    seoKeywords: ["portfolio", "next.js", "typescript", "creator"],
    footerText: "Built for long-term maintenance, not one-off screenshots.",
    icp: {
      text: "ICP备案占位信息",
      url: "https://beian.miit.gov.cn/",
    },
  },
  navigation: [
    {
      id: "nav-home",
      label: "首页",
      href: "#home",
      openInNewTab: false,
      isEnabled: true,
      sortOrder: 0,
    },
    {
      id: "nav-skills",
      label: "技能",
      href: "#skills",
      openInNewTab: false,
      isEnabled: true,
      sortOrder: 1,
    },
    {
      id: "nav-projects",
      label: "项目",
      href: "#projects",
      openInNewTab: false,
      isEnabled: true,
      sortOrder: 2,
    },
    {
      id: "nav-contact",
      label: "联系",
      href: "#contact",
      openInNewTab: false,
      isEnabled: true,
      sortOrder: 3,
    },
  ],
  sections: [
    { key: "navigation", title: "导航栏", isEnabled: true, sortOrder: 0 },
    { key: "hero", title: "Hero", isEnabled: true, sortOrder: 1 },
    { key: "skills", title: "技能栈", isEnabled: true, sortOrder: 2 },
    { key: "projects", title: "项目", isEnabled: true, sortOrder: 3 },
    { key: "contact", title: "联系我", isEnabled: true, sortOrder: 4 },
    { key: "footer", title: "页脚", isEnabled: true, sortOrder: 5 },
  ],
  hero: {
    greeting: "你好，我是",
    name: "Kek",
    titles: ["全栈开发者", "前端体验控", "系统构建者"],
    description:
      "这个骨架把内容模型、模板渲染和后台信息架构先对齐，再往 UI 和发布链路继续扩展。",
    avatar: {
      sourceType: "external",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      alt: "Profile portrait",
      width: 400,
      height: 400,
    },
    primaryAction: {
      label: "查看项目",
      href: "#projects",
    },
    secondaryAction: {
      label: "进入后台",
      href: "/admin",
    },
  },
  skills: [
    {
      id: "skills-frontend",
      title: "前端开发",
      subtitle: "响应式界面、设计系统、交互实现",
      sortOrder: 0,
      isEnabled: true,
      items: [
        { id: "sk-1", name: "Next.js", level: 92, sortOrder: 0, isEnabled: true },
        { id: "sk-2", name: "React", level: 94, sortOrder: 1, isEnabled: true },
        { id: "sk-3", name: "Tailwind CSS", level: 88, sortOrder: 2, isEnabled: true },
      ],
    },
    {
      id: "skills-backend",
      title: "后端开发",
      subtitle: "数据库、API、发布链路",
      sortOrder: 1,
      isEnabled: true,
      items: [
        { id: "sk-4", name: "Prisma", level: 85, sortOrder: 0, isEnabled: true },
        { id: "sk-5", name: "PostgreSQL", level: 84, sortOrder: 1, isEnabled: true },
        { id: "sk-6", name: "Auth.js", level: 76, sortOrder: 2, isEnabled: true },
      ],
    },
  ],
  projects: [
    {
      id: "project-admin",
      title: "Creator Admin Workspace",
      description: "三栏编辑、模板切换和媒体管理围绕同一份结构化数据完成。",
      techStack: ["Next.js", "TypeScript", "Prisma"],
      visual: {
        type: "icon",
        iconName: "layout-dashboard",
      },
      repoUrl: "https://github.com/example/myhome",
      previewUrl: "/admin",
      isFeatured: true,
      sortOrder: 0,
      isEnabled: true,
    },
    {
      id: "project-template",
      title: "Template Runtime",
      description: "模板注册显式化，样式和脚本边界跟模板目录保持一致。",
      techStack: ["Registry", "Dynamic Import", "Snapshot DTO"],
      visual: {
        type: "icon",
        iconName: "sparkles",
      },
      isFeatured: true,
      sortOrder: 1,
      isEnabled: true,
    },
  ],
  contacts: [
    {
      id: "contact-email",
      type: "email",
      label: "邮箱",
      value: "hello@example.com",
      href: "mailto:hello@example.com",
      icon: {
        type: "builtin",
        name: "mail",
      },
      openInNewTab: false,
      sortOrder: 0,
      isEnabled: true,
    },
    {
      id: "contact-github",
      type: "github",
      label: "GitHub",
      value: "github.com/example",
      href: "https://github.com/example",
      icon: {
        type: "builtin",
        name: "github",
      },
      openInNewTab: true,
      sortOrder: 1,
      isEnabled: true,
    },
  ],
};

export const mockThemeState: SiteThemeState = {
  templateId: "neon-tech",
  templateConfig: {
    accentColor: "#22d3ee",
    enableParticles: true,
    particleDensity: 72,
    heroStyle: "typing",
    cardStyle: "glow",
  },
};

export async function getMockPublishedSite() {
  return {
    data: mockSiteRenderData,
    themeState: mockThemeState,
  };
}
