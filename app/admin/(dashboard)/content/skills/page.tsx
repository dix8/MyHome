import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { ContentSkillsEditor } from "@/features/admin/components/content-skills-editor";
import { ContentSubnav } from "@/features/admin/components/content-subnav";
import { getContentPageData } from "@/features/admin/server/content";
import { contentStatusMessage } from "@/features/admin/server/content-flash";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "技能",
};

export default async function ContentSkillsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const data = await getContentPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护技能分组、技能项与对应排序。"
      status="实时"
      title="Content"
    >
      <ContentSubnav activeHref="/admin/content/skills" />
      <ContentSkillsEditor
        data={data}
        flashMessage={contentStatusMessage(params?.status)}
        focusTarget={params?.focus}
      />
    </AdminShell>
  );
}
