import type { Metadata } from "next";

import { AccountSettingsEditor } from "@/features/admin/components/account-settings-editor";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { SettingsSubnav } from "@/features/admin/components/settings-subnav";
import { getSettingsPageData } from "@/features/admin/server/settings";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "管理员账号",
};

export default async function AccountSettingsPage() {
  const data = await getSettingsPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护后台管理员账号本身，包括显示名称、登录邮箱与密码。"
      status="实时"
      title="Settings"
    >
      <SettingsSubnav activeHref="/admin/settings/account" />
      <AccountSettingsEditor data={{ account: data.account }} />
    </AdminShell>
  );
}
