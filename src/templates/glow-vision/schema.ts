import type { TemplateSchema } from "@/templates/types";

export const schema = {
  sections: [
    {
      key: "appearance",
      title: "视觉样式",
      description: "控制模板主色、辅助色和 Hero 标题的表现方式。",
      fields: [
        {
          type: "color",
          key: "accentPrimary",
          label: "主强调色",
          defaultValue: "#00f0ff",
        },
        {
          type: "color",
          key: "accentSecondary",
          label: "辅助强调色",
          defaultValue: "#7c3aed",
        },
        {
          type: "select",
          key: "heroTitleMode",
          label: "Hero 标题效果",
          defaultValue: "typing",
          options: [
            { label: "打字机", value: "typing" },
            { label: "静态标签", value: "static" },
          ],
        },
      ],
    },
    {
      key: "effects",
      title: "背景效果",
      description: "控制粒子背景的开启状态和密度。",
      fields: [
        {
          type: "switch",
          key: "enableParticles",
          label: "启用粒子背景",
          defaultValue: true,
        },
        {
          type: "slider",
          key: "particleDensity",
          label: "粒子密度",
          defaultValue: 80,
          min: 24,
          max: 140,
          step: 4,
        },
      ],
    },
  ],
} satisfies TemplateSchema;
