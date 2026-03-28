export const adminNavigation = [
  {
    href: "/admin",
    label: "总览",
    shortLabel: "Dashboard",
    description: "站点概况、当前模板和最近动作。",
  },
  {
    href: "/admin/content",
    label: "内容",
    shortLabel: "Content",
    description: "首页模块、导航、技能、项目与联系方式。",
  },
  {
    href: "/admin/templates",
    label: "模板",
    shortLabel: "Templates",
    description: "模板选择、配置与兼容性检查。",
  },
  {
    href: "/admin/media",
    label: "媒体",
    shortLabel: "Media",
    description: "本地上传资源、引用状态与文件信息。",
  },
  {
    href: "/admin/settings",
    label: "设置",
    shortLabel: "Settings",
    description: "站点信息、SEO 和后台账号安全。",
  },
] as const;
