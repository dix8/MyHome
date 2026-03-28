import type { TemplateSchema } from "@/templates/types";

export const schema = {
  sections: [
    {
      key: "appearance",
      title: "视觉样式",
      description: "定义模板主色、项目卡片质感和 Hero 展示方式。",
      fields: [
        {
          type: "color",
          key: "accentColor",
          label: "强调色",
          defaultValue: "#22d3ee",
        },
        {
          type: "select",
          key: "heroStyle",
          label: "Hero 样式",
          defaultValue: "typing",
          options: [
            { label: "打字机", value: "typing" },
            { label: "静态标签", value: "stacked" },
          ],
        },
        {
          type: "select",
          key: "cardStyle",
          label: "项目卡片风格",
          defaultValue: "glow",
          options: [
            { label: "微光", value: "glow" },
            { label: "平面", value: "flat" },
          ],
        },
      ],
    },
    {
      key: "effects",
      title: "模板效果",
      description: "控制模板私有脚本与背景动效密度。",
      fields: [
        {
          type: "switch",
          key: "enableParticles",
          label: "粒子背景",
          defaultValue: true,
        },
        {
          type: "slider",
          key: "particleDensity",
          label: "粒子密度",
          defaultValue: 72,
          min: 20,
          max: 160,
          step: 4,
        },
      ],
    },
  ],
} satisfies TemplateSchema;
