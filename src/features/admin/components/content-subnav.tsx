import { AdminSectionTabs } from "@/features/admin/components/admin-section-tabs";

const contentTabs = [
  {
    href: "/admin/content/structure",
    label: "页面结构",
    description: "模块开关、顺序和页面级入口。",
  },
  {
    href: "/admin/content/hero",
    label: "Hero 与导航",
    description: "首屏文案、头像与顶部导航。",
  },
  {
    href: "/admin/content/projects",
    label: "项目",
    description: "项目列表、封面、链接与推荐状态。",
  },
  {
    href: "/admin/content/skills",
    label: "技能",
    description: "技能分组、技能项与排序。",
  },
  {
    href: "/admin/content/contacts",
    label: "联系方式",
    description: "联系渠道、图标和跳转链接。",
  },
] as const;

export function ContentSubnav({ activeHref }: { activeHref: (typeof contentTabs)[number]["href"] }) {
  return <AdminSectionTabs activeHref={activeHref} tabs={[...contentTabs]} />;
}
