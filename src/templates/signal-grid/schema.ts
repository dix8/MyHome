import type { TemplateSchema } from "@/templates/types";

export const schema = {
  sections: [
    {
      key: "appearance",
      title: "视觉样式",
      description: "控制信号网格模板的主辅强调色以及边框发光状态。",
      fields: [
        {
          type: "color",
          key: "primaryColor",
          label: "主强调色",
          defaultValue: "#6ee7ff",
        },
        {
          type: "color",
          key: "secondaryColor",
          label: "辅助强调色",
          defaultValue: "#ff8a5b",
        },
        {
          type: "switch",
          key: "frameGlow",
          label: "启用边框发光",
          defaultValue: true,
        },
      ],
    },
  ],
} satisfies TemplateSchema;
