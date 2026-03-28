import type { TemplateManifest } from "@/templates/types";

export const manifest = {
  id: "signal-grid",
  name: "Signal Grid",
  version: "0.1.0",
  description: "未来控制台风模板，强调网格框架、状态面板和系统信号语言。",
  cover: "signal-grid",
  tags: ["未来感", "HUD", "网格"],
  supportedSections: ["navigation", "hero", "skills", "projects", "contact", "footer"],
  defaultConfig: {
    primaryColor: "#6ee7ff",
    secondaryColor: "#ff8a5b",
    frameGlow: true,
  },
} satisfies TemplateManifest;
