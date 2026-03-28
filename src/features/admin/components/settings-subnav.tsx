import { AdminSectionTabs } from "@/features/admin/components/admin-section-tabs";

const settingsTabs = [
  {
    href: "/admin/settings/site",
    label: "站点与展示",
    description: "站点名称、SEO、页脚与备案信息。",
  },
  {
    href: "/admin/settings/account",
    label: "管理员账号",
    description: "显示名称、登录邮箱与密码。",
  },
] as const;

export function SettingsSubnav({ activeHref }: { activeHref: (typeof settingsTabs)[number]["href"] }) {
  return <AdminSectionTabs activeHref={activeHref} tabs={[...settingsTabs]} />;
}
