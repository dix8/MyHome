import type { TemplateSchema } from "@/templates/types";

export const schema = {
  sections: [
    {
      key: "appearance",
      title: "视觉样式",
      fields: [
        {
          type: "color",
          key: "accentColor",
          label: "强调色",
          defaultValue: "#0f766e",
        },
        {
          type: "select",
          key: "surfaceTone",
          label: "卡片底色",
          defaultValue: "linen",
          options: [
            { label: "亚麻白", value: "linen" },
            { label: "石墨灰", value: "graphite" },
          ],
        },
        {
          type: "select",
          key: "layoutDensity",
          label: "版式密度",
          defaultValue: "airy",
          options: [
            { label: "舒展", value: "airy" },
            { label: "紧凑", value: "compact" },
          ],
        },
      ],
    },
  ],
} satisfies TemplateSchema;
