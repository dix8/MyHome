import type { TemplateManifest } from "@/templates/types";

export const manifest = {
  id: "neon-tech",
  name: "Neon Tech",
  version: "0.1.0",
  description: "更产品化的科技风模板，强调秩序、信息层级和专业感。",
  cover: "aurora-grid",
  tags: ["科技感", "深色", "动态氛围"],
  supportedSections: ["navigation", "hero", "skills", "projects", "contact", "footer"],
  defaultConfig: {
    accentColor: "#22d3ee",
    enableParticles: true,
    particleDensity: 72,
    heroStyle: "typing",
    cardStyle: "glow",
  },
} satisfies TemplateManifest;
