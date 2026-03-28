import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { ContentHeroEditor } from "@/features/admin/components/content-hero-editor";
import { ContentSubnav } from "@/features/admin/components/content-subnav";
import { getContentPageData } from "@/features/admin/server/content";
import { contentStatusMessage } from "@/features/admin/server/content-flash";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "Hero 与导航",
};

export default async function ContentHeroPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const data = await getContentPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护 Hero 首屏和顶部导航，避免与项目、技能、联系方式混在同一页。"
      status="实时"
      title="Content"
    >
      <ContentSubnav activeHref="/admin/content/hero" />
      <ContentHeroEditor
        key={`${data.heroProfile.name}:${data.heroProfile.avatarSourceType}:${data.heroProfile.avatarMediaAssetId}:${data.heroProfile.avatarExternalUrl}`}
        data={data}
        flashMessage={contentStatusMessage(params?.status)}
        focusTarget={params?.focus}
      />
    </AdminShell>
  );
}
