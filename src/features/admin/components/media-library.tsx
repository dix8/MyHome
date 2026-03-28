import Image from "next/image";

import { ConfirmActionButton } from "@/features/admin/components/confirm-action-button";
import { deleteMediaAction, uploadMediaAction } from "@/features/admin/server/media-actions";
import type { MediaPageData } from "@/features/admin/server/media";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";
import { FileInput } from "@/shared/ui/file-input";

function formatBytes(value: string) {
  const bytes = Number(value);

  if (Number.isNaN(bytes)) {
    return value;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({
  data,
  flashMessage,
}: {
  data: MediaPageData;
  flashMessage: string | null;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-5">
        {flashMessage ? (
          <div className="rounded-[var(--radius-md)] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {flashMessage}
          </div>
        ) : null}

        <Card>
          <CardHeader
            description="上传图片后会写入 `public/uploads` 并登记到 `media_assets`。"
            title="上传媒体"
          />
          <form action={uploadMediaAction} className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-[var(--text-secondary)]">图片文件</span>
              <FileInput
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                name="file"
                required
              />
            </label>
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-[var(--text-secondary)]">Alt 文案</span>
              <input
                className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
                name="altText"
                placeholder="可选"
                type="text"
              />
            </label>
            <div className="flex items-end xl:col-span-2">
              <button
                className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 text-sm font-semibold text-slate-950 transition hover:brightness-110 sm:w-auto sm:min-w-[180px]"
                type="submit"
              >
                上传到媒体库
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            description="这里展示本地上传资源和引用情况。已被业务表单引用的资源不能直接删除。"
            title="媒体资源"
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.assets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/4"
              >
                <div className="relative aspect-[4/3] bg-black/20">
                  <Image
                    alt={asset.altText ?? asset.originalName}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    src={asset.publicUrl}
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{asset.originalName}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "尺寸待补"} ·{" "}
                        {formatBytes(asset.sizeBytes)}
                      </p>
                    </div>
                    <Badge tone={asset.usage.total > 0 ? "success" : "neutral"}>
                      {asset.usage.total > 0 ? "in use" : "free"}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">引用位置</p>
                    {asset.usage.labels.length > 0 ? (
                      asset.usage.labels.map((label) => (
                        <div
                          key={label}
                          className="rounded-[var(--radius-md)] border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/82"
                        >
                          {label}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/10 px-3 py-2 text-xs text-[var(--text-secondary)]">
                        当前没有业务引用。
                      </div>
                    )}
                  </div>

                  <form action={deleteMediaAction} className="mt-4">
                    <input name="mediaAssetId" type="hidden" value={asset.id} />
                    <div className="w-full">
                      <ConfirmActionButton
                        confirmLabel="确认删除资源"
                        confirmText="删除媒体资源后会从媒体库移除，且磁盘文件会被删除。确定继续吗？"
                        disabled={asset.usage.total > 0}
                        variant="danger"
                      >
                        删除资源
                      </ConfirmActionButton>
                    </div>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5">
        <Card className="h-fit">
          <CardHeader
            description={`当前管理员：${data.account.displayName} / ${data.account.email}`}
            title="媒体统计"
          />
          <div className="mt-5 grid gap-3">
            {[
              ["总资源数", String(data.stats.totalAssets)],
              ["已引用资源", String(data.stats.referencedAssets)],
              ["空闲资源", String(data.stats.unreferencedAssets)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader
            description="当前已接通媒体上传和 Hero 头像的本地资源选择。后续可以继续把项目封面和联系方式图标接进来。"
            title="联动范围"
          />
          <div className="mt-5 grid gap-3">
            {["媒体上传到 public/uploads", "数据库记录 media_assets", "删除前校验业务引用", "Settings / Hero 头像支持本地媒体"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white/82"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
