import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { SettingsEditor } from "@/features/admin/components/settings-editor";
import { SettingsSubnav } from "@/features/admin/components/settings-subnav";
import { getSettingsPageData } from "@/features/admin/server/settings";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "站点与展示",
};

export default async function SiteSettingsPage() {
  const data = await getSettingsPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护站点名称、SEO、页脚与备案信息。保存后首页和后台会读取最新内容。"
      status="实时"
      title="Settings"
    >
      <SettingsSubnav activeHref="/admin/settings/site" />
      <SettingsEditor data={data} />
    </AdminShell>
  );
}
