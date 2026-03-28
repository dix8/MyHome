import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { ContentContactsEditor } from "@/features/admin/components/content-contacts-editor";
import { ContentSubnav } from "@/features/admin/components/content-subnav";
import { getContentPageData } from "@/features/admin/server/content";
import { contentStatusMessage } from "@/features/admin/server/content-flash";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "联系方式",
};

export default async function ContentContactsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const data = await getContentPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live form</Badge>}
      description="当前页只维护联系方式、图标、跳转链接与显示状态。"
      status="实时"
      title="Content"
    >
      <ContentSubnav activeHref="/admin/content/contacts" />
      <ContentContactsEditor
        key={JSON.stringify(
          data.contacts.map((contact) => ({
            externalUrl: contact.iconExternalUrl,
            iconMediaAssetId: contact.iconMediaAssetId,
            iconSourceType: contact.iconSourceType,
            iconType: contact.iconType,
            id: contact.id,
          })),
        )}
        data={data}
        flashMessage={contentStatusMessage(params?.status)}
        focusTarget={params?.focus}
      />
    </AdminShell>
  );
}
