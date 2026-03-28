import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { ContentProjectsEditor } from "@/features/admin/components/content-projects-editor";
import { ContentSubnav } from "@/features/admin/components/content-subnav";
import { getContentPageData } from "@/features/admin/server/content";
import { contentStatusMessage } from "@/features/admin/server/content-flash";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "项目",
};

export default async function ContentProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const data = await getContentPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护项目列表、封面、链接、排序与推荐状态。"
      status="实时"
      title="Content"
    >
      <ContentSubnav activeHref="/admin/content/projects" />
      <ContentProjectsEditor
        data={data}
        flashMessage={contentStatusMessage(params?.status)}
        focusTarget={params?.focus}
      />
    </AdminShell>
  );
}
