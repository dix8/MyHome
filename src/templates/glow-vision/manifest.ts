import type { TemplateManifest } from "@/templates/types";

export const manifest = {
  id: "glow-vision",
  name: "Glow Vision",
  version: "0.1.0",
  description: "霓虹暗色单页模板，强调粒子背景、Hero 气场和更强的个人品牌展示。",
  cover: "glow-console",
  tags: ["霓虹", "打字机", "粒子背景"],
  supportedSections: ["navigation", "hero", "skills", "projects", "contact", "footer"],
  defaultConfig: {
    accentPrimary: "#00f0ff",
    accentSecondary: "#7c3aed",
    heroTitleMode: "typing",
    enableParticles: true,
    particleDensity: 80,
  },
} satisfies TemplateManifest;
