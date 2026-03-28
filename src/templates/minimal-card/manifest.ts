import type { TemplateManifest } from "@/templates/types";

export const manifest = {
  id: "minimal-card",
  name: "Minimal Card",
  version: "0.1.0",
  description: "简约编辑感模板，强调留白、阅读节奏和更成熟克制的内容表达。",
  cover: "linen-card",
  tags: ["极简", "卡片式", "编辑向"],
  supportedSections: ["navigation", "hero", "skills", "projects", "contact", "footer"],
  defaultConfig: {
    accentColor: "#0f766e",
    surfaceTone: "linen",
    layoutDensity: "airy",
  },
} satisfies TemplateManifest;
