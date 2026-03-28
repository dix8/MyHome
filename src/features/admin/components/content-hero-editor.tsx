"use client";

import { useActionState, useState } from "react";

import type { ContentFormState, ContentPageData } from "@/features/admin/server/content";
import { saveContentAction } from "@/features/admin/server/content-actions";
import {
  ContentAvatarPreview,
  ContentContextRail,
  ContentFloatingSaveBar,
  ContentMoveButtons,
  ContentSelectField,
  ContentTextField,
  ContentToggleField,
  initialContentFormState,
  resolveMediaUrl,
  useContentDirtyForm,
  useContentFocusHighlight,
} from "@/features/admin/components/content-form-shared";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";
import { MediaSelect } from "@/shared/ui/media-select";

export function ContentHeroEditor({
  data,
  flashMessage,
  focusTarget,
}: {
  data: ContentPageData;
  flashMessage?: string | null;
  focusTarget?: string;
}) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(saveContentAction, initialContentFormState);
  const { formRef, handleFormChange, handleResetChanges, isDirty } = useContentDirtyForm({
    data,
    status: state.status,
  });
  const [avatarSourceType, setAvatarSourceType] = useState<"none" | "local" | "external">(
    data.heroProfile.avatarSourceType,
  );
  const [avatarMediaAssetId, setAvatarMediaAssetId] = useState(data.heroProfile.avatarMediaAssetId);
  const [avatarExternalUrl, setAvatarExternalUrl] = useState(data.heroProfile.avatarExternalUrl);

  useContentFocusHighlight({
    flashMessage,
    focusTarget,
    status: state.status,
  });

  const heroAvatarPreviewUrl =
    avatarSourceType === "local"
      ? resolveMediaUrl(data.mediaOptions, avatarMediaAssetId)
      : avatarSourceType === "external"
        ? avatarExternalUrl
        : "";

  return (
    <form
      action={formAction}
      className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]"
      onChange={handleFormChange}
      ref={formRef}
    >
      <div className="grid gap-5">
        <Card>
          <CardHeader
            action={<Badge tone="neutral">首屏内容</Badge>}
            description="Hero 是首页第一屏内容，头像、文案和按钮都在这里统一维护。"
            title="Hero"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ContentTextField
              defaultValue={data.heroProfile.greeting}
              label="称呼"
              name="heroGreeting"
              placeholder="例如：你好，我是"
            />
            <ContentTextField
              defaultValue={data.heroProfile.name}
              label="姓名"
              name="heroName"
              placeholder="例如：Kek"
            />
            <div className="md:col-span-2">
              <ContentTextField
                defaultValue={data.heroProfile.description}
                label="首屏描述"
                name="heroDescription"
                placeholder="说明你是谁、你做什么。"
                rows={5}
                textarea
              />
            </div>
            <ContentSelectField
              defaultValue={data.heroProfile.avatarSourceType}
              label="头像来源"
              name="heroAvatarSourceType"
              onValueChange={(value) =>
                setAvatarSourceType((value as "none" | "local" | "external") ?? data.heroProfile.avatarSourceType)
              }
              options={[
                { label: "不使用头像", value: "none" },
                { label: "本地媒体库", value: "local" },
                { label: "外部图片链接", value: "external" },
              ]}
            />
            {avatarSourceType === "local" ? (
              <label className="grid min-w-0 gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">本地头像</span>
                <MediaSelect
                  defaultValue={data.heroProfile.avatarMediaAssetId}
                  name="heroAvatarMediaAssetId"
                  onValueChange={setAvatarMediaAssetId}
                  options={[
                    { label: "未选择", value: "" },
                    ...data.mediaOptions.map((asset) => ({
                      imageUrl: asset.publicUrl,
                      label: asset.label,
                      value: asset.id,
                    })),
                  ]}
                />
              </label>
            ) : null}
            {avatarSourceType === "external" ? (
              <div className="md:col-span-2">
                <ContentTextField
                  defaultValue={data.heroProfile.avatarExternalUrl}
                  label="头像外链"
                  name="heroAvatarExternalUrl"
                  onValueChange={setAvatarExternalUrl}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
            ) : null}
            <ContentAvatarPreview
              previewName={data.heroProfile.name || "未命名用户"}
              title="当前头像预览"
              url={heroAvatarPreviewUrl}
            />
            <div className="md:col-span-2">
              <ContentTextField
                defaultValue={data.heroProfile.titles}
                label="Hero 标题组"
                name="heroTitles"
                placeholder={"每行一个标题，例如：\n全栈开发者\n系统构建者\n前端体验控"}
                rows={5}
                textarea
              />
            </div>
            <ContentTextField
              defaultValue={data.heroProfile.primaryButtonLabel}
              label="主按钮文案"
              name="primaryButtonLabel"
              placeholder="例如：查看项目"
            />
            <ContentTextField
              defaultValue={data.heroProfile.primaryButtonHref}
              label="主按钮链接"
              name="primaryButtonHref"
              placeholder="#projects"
            />
            <ContentTextField
              defaultValue={data.heroProfile.secondaryButtonLabel}
              label="次按钮文案"
              name="secondaryButtonLabel"
              placeholder="例如：联系我"
            />
            <ContentTextField
              defaultValue={data.heroProfile.secondaryButtonHref}
              label="次按钮链接"
              name="secondaryButtonHref"
              placeholder="#contact"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            action={<Badge tone="neutral">{data.navigation.length} 项</Badge>}
            description="导航项统一放在这里维护，名称、链接、新窗口行为和排序都在同一页处理。"
            title="导航菜单"
          />
          <div className="mt-5 grid gap-4">
            {data.navigation.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4"
                data-focus-target={`navigation:${item.id}`}
              >
                <input name="navigationIds" type="hidden" value={item.id} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{item.label || "未命名导航"}</p>
                    <Badge tone={item.isEnabled ? "neutral" : "warning"}>{item.isEnabled ? "已启用" : "已停用"}</Badge>
                    <Badge tone="neutral">{`第 ${index + 1} 项`}</Badge>
                  </div>
                  <ContentMoveButtons
                    disableDown={index === data.navigation.length - 1}
                    disableUp={index === 0}
                    disabled={isDirty}
                    target={`navigation:${item.id}`}
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 md:[&>*]:min-w-0">
                  <ContentTextField
                    defaultValue={item.label}
                    label="导航名称"
                    name={`nav-label-${item.id}`}
                    placeholder="例如：项目"
                  />
                  <ContentTextField
                    defaultValue={item.href}
                    label="导航链接"
                    name={`nav-href-${item.id}`}
                    placeholder="#projects"
                  />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ContentToggleField
                    defaultChecked={item.isEnabled}
                    description="关闭后该导航项不会在前台显示。"
                    label="启用该导航项"
                    name={`nav-enabled-${item.id}`}
                  />
                  <ContentToggleField
                    defaultChecked={item.openInNewTab}
                    description="开启后导航链接会在新窗口打开。"
                    label="新窗口打开"
                    name={`nav-newtab-${item.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ContentContextRail data={data} flashMessage={flashMessage} />
      <ContentFloatingSaveBar dirty={isDirty} message={state.message} onReset={handleResetChanges} />
    </form>
  );
}
