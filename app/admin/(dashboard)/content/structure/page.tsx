import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { ContentStructureEditor } from "@/features/admin/components/content-structure-editor";
import { ContentSubnav } from "@/features/admin/components/content-subnav";
import { getContentPageData } from "@/features/admin/server/content";
import { contentStatusMessage } from "@/features/admin/server/content-flash";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "页面结构",
};

export default async function ContentStructurePage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const data = await getContentPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护页面结构，包括模块开关、顺序和页面级入口。"
      status="实时"
      title="Content"
    >
      <ContentSubnav activeHref="/admin/content/structure" />
      <ContentStructureEditor
        data={data}
        flashMessage={contentStatusMessage(params?.status)}
        focusTarget={params?.focus}
      />
    </AdminShell>
  );
}
