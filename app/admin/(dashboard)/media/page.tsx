import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { MediaLibrary } from "@/features/admin/components/media-library";
import { getMediaPageData } from "@/features/admin/server/media";
import { Badge } from "@/shared/ui/badge";

export const metadata: Metadata = {
  title: "媒体",
};

function statusMessage(status?: string) {
  if (status === "uploaded") {
    return "媒体资源已上传，当前可以在设置页的 Hero 头像中选择它。";
  }

  if (status === "deleted") {
    return "媒体资源已删除。";
  }

  if (status === "in-use") {
    return "该媒体资源正在被业务内容引用，不能直接删除。";
  }

  if (status === "unsupported-type") {
    return "当前只支持上传常见图片格式。";
  }

  if (status === "upload-error" || status === "delete-error") {
    return "媒体操作失败，请检查表单内容后重试。";
  }

  return null;
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const data = await getMediaPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">media library</Badge>}
      description="媒体库现在已经接通真实上传、资源列表、引用校验和删除动作。上传后的图片可以在设置页 Hero 头像里直接选择。"
      title="Media"
    >
      <MediaLibrary data={data} flashMessage={statusMessage(params?.status)} />
    </AdminShell>
  );
}
