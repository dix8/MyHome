"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { moveContentItemAction } from "@/features/admin/server/content-actions";
import type { ContentFormState, ContentPageData } from "@/features/admin/server/content";
import { captureFormSnapshot, formMatchesSnapshot, restoreFormSnapshot } from "@/shared/lib/form-snapshot";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { FormSelect } from "@/shared/ui/form-select";
import { MediaSelect } from "@/shared/ui/media-select";

export const initialContentFormState: ContentFormState = {
  status: "idle",
  message: null,
};

export function useContentDirtyForm<T>({
  data,
  status,
}: {
  data: T;
  status: ContentFormState["status"];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const snapshotRef = useRef<ReturnType<typeof captureFormSnapshot> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!formRef.current) {
      return;
    }

    snapshotRef.current = captureFormSnapshot(formRef.current);

    const resetDirty = window.setTimeout(() => {
      setIsDirty(false);
    }, 0);

    return () => {
      window.clearTimeout(resetDirty);
    };
  }, [data]);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    if (formRef.current) {
      snapshotRef.current = captureFormSnapshot(formRef.current);
    }

    const resetDirty = window.setTimeout(() => {
      setIsDirty(false);
    }, 0);

    const refresh = window.setTimeout(() => {
      router.refresh();
    }, 0);

    return () => {
      window.clearTimeout(resetDirty);
      window.clearTimeout(refresh);
    };
  }, [router, status]);

  function handleResetChanges() {
    if (!formRef.current) {
      return;
    }

    restoreFormSnapshot(formRef.current, snapshotRef.current);
    setIsDirty(false);
  }

  function handleFormChange() {
    if (!formRef.current) {
      return;
    }

    setIsDirty(!formMatchesSnapshot(formRef.current, snapshotRef.current));
  }

  return {
    formRef,
    handleFormChange,
    handleResetChanges,
    isDirty,
  };
}

export function ContentSubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} size="lg" type="submit">
      {pending ? "保存中..." : "保存当前页面"}
    </Button>
  );
}

export function ContentFloatingSaveBar({
  dirty,
  message,
  onReset,
}: {
  dirty: boolean;
  message: string | null;
  onReset: () => void;
}) {
  const { pending } = useFormStatus();

  if (!dirty) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-40 flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-white/10 bg-[var(--bg-panel)] px-5 py-4 shadow-[var(--shadow-panel)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{pending ? "正在保存内容..." : "你有未保存的更改"}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {pending
              ? "正在把当前页面内容写入站点。"
              : message ?? "当前页面修改还没有写入数据库。"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button disabled={pending} onClick={onReset} type="button" variant="secondary">
            撤销更改
          </Button>
          <ContentSubmitButton />
        </div>
      </div>
    </div>
  );
}

export function ContentTextField({
  defaultValue,
  label,
  name,
  onValueChange,
  placeholder,
  rows = 4,
  textarea = false,
}: {
  defaultValue: string;
  label: string;
  name: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  textarea?: boolean;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {textarea ? (
        <textarea
          className="min-h-24 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          defaultValue={defaultValue}
          name={name}
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          defaultValue={defaultValue}
          name={name}
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
          placeholder={placeholder}
          type="text"
        />
      )}
    </label>
  );
}

export function ContentToggleField({
  defaultChecked,
  description,
  label,
  name,
}: {
  defaultChecked: boolean;
  description: string;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>
      <input
        className="mt-1 h-5 w-5 rounded border-white/20 bg-transparent accent-cyan-400"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
    </label>
  );
}

export function ContentSelectField({
  defaultValue,
  label,
  name,
  onValueChange,
  options,
}: {
  defaultValue: string;
  label: string;
  name: string;
  onValueChange?: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <FormSelect
        defaultValue={defaultValue}
        key={`${name}:${defaultValue}`}
        name={name}
        onValueChange={onValueChange}
        options={options}
      />
    </label>
  );
}

export function ContentMediaSelectField({
  defaultValue,
  label,
  mediaOptions,
  name,
  onValueChange,
}: {
  defaultValue: string;
  label: string;
  mediaOptions: ContentPageData["mediaOptions"];
  name: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <MediaSelect
        defaultValue={defaultValue}
        name={name}
        onValueChange={onValueChange}
        options={[
          { label: "未选择", value: "" },
          ...mediaOptions.map((asset) => ({
            imageUrl: asset.publicUrl,
            label: asset.label,
            value: asset.id,
          })),
        ]}
      />
    </label>
  );
}

export function resolveMediaUrl(options: ContentPageData["mediaOptions"], mediaAssetId: string) {
  return options.find((asset) => asset.id === mediaAssetId)?.publicUrl ?? "";
}

export function ContentImagePreview({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/10 p-4 md:col-span-2">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{title}</p>
      {url ? (
        <div className="mt-3 overflow-hidden rounded-[20px] border border-white/10 bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={title} className="h-40 w-full object-cover" src={url} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">当前没有可预览的图片资源。</p>
      )}
    </div>
  );
}

export function ContentAvatarPreview({
  previewName,
  title,
  url,
}: {
  previewName: string;
  title: string;
  url: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/10 p-4 md:col-span-2">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{title}</p>
      {url ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-[20px] border border-white/10 bg-[#0b1120] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">完整素材</p>
            <div className="mt-3 flex min-h-[320px] items-center justify-center overflow-hidden rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={title} className="max-h-[288px] w-auto max-w-full object-contain" src={url} />
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_42%),linear-gradient(180deg,rgba(8,15,28,0.95),rgba(5,9,19,0.98))] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">站点中的显示效果</p>
            <div className="mt-4 rounded-[20px] border border-white/10 bg-[#0a1020] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex h-32 w-32 rounded-full bg-linear-to-br from-cyan-400 via-blue-500 to-violet-500 p-[3px] shadow-[0_0_30px_rgba(34,211,238,0.18)]">
                  <div className="h-full w-full overflow-hidden rounded-full bg-[#09101f]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={`${previewName} avatar preview`} className="h-full w-full object-cover" src={url} />
                  </div>
                </div>
                <p className="mt-5 text-sm text-cyan-200">{previewName ? `你好，我是 ${previewName}` : "你好，我是"}</p>
                <p className="mt-2 text-xl font-semibold text-white">头像最终会以圆形裁切展示</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  左侧看完整素材，右侧看实际站点中的头像观感。这样可以同时判断是否完整、是否适合圆形展示。
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">当前没有可预览的图片资源。</p>
      )}
    </div>
  );
}

export function ContentMoveButtons({
  disableDown = false,
  disableUp = false,
  disabled = false,
  target,
}: {
  disableDown?: boolean;
  disableUp?: boolean;
  disabled?: boolean;
  target: string;
}) {
  const moveUpAction = moveContentItemAction.bind(null, `${target}:up`);
  const moveDownAction = moveContentItemAction.bind(null, `${target}:down`);
  const disabledTitle = disabled ? "当前有未保存修改，请先保存后再调整顺序。" : undefined;

  return (
    <div className="flex gap-2">
      <Button
        disabled={disabled || disableUp}
        formAction={moveUpAction}
        title={disabled ? disabledTitle : disableUp ? "已经是当前列表中的第一项。" : undefined}
        type="submit"
        variant="secondary"
      >
        上移
      </Button>
      <Button
        disabled={disabled || disableDown}
        formAction={moveDownAction}
        title={disabled ? disabledTitle : disableDown ? "已经是当前列表中的最后一项。" : undefined}
        type="submit"
        variant="secondary"
      >
        下移
      </Button>
    </div>
  );
}

export function ContentItemHeader({
  enabled,
  indexLabel,
  title,
}: {
  enabled: boolean;
  indexLabel: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-medium text-white">{title}</p>
      <Badge tone={enabled ? "neutral" : "warning"}>{enabled ? "已启用" : "已停用"}</Badge>
      <Badge tone="neutral">{indexLabel}</Badge>
    </div>
  );
}

export function ContentContextRail({
  data,
  flashMessage,
}: {
  data: ContentPageData;
  flashMessage?: string | null;
}) {
  return (
    <div className="grid gap-5 xl:sticky xl:top-24">
      {flashMessage ? (
        <div className="rounded-[var(--radius-lg)] border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-200">
          {flashMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader description="右侧展示当前内容概况，当前页面只处理一个明确的内容范围。" title="当前内容" />
        <div className="mt-5 grid gap-3">
          {[
            ["当前编辑者", data.account.displayName || data.account.email],
            ["模块数量", `${data.sections.length} 个`],
            ["导航项", `${data.navigation.length} 项`],
            ["项目", `${data.projects.length} 个`],
            ["技能分组 / 技能项", `${data.skillGroups.length} / ${data.skillGroups.reduce((count, group) => count + group.items.length, 0)}`],
            ["联系方式", `${data.contacts.length} 项`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
              <p className="mt-2 text-sm text-white/88">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader description="分页面编辑之后，每次只关注一个模块，减少整页来回跳转。" title="下一步" />
        <div className="mt-5 grid gap-3">
          <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            当前子页面保存的是一个明确的内容范围。完成当前块之后，再切去其它子页继续编辑即可。
          </div>
          <Button asChild variant="secondary">
            <Link href="/">查看首页效果</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function HiddenHeroFields({ data }: { data: ContentPageData }) {
  return (
    <>
      <input name="heroGreeting" type="hidden" value={data.heroProfile.greeting} />
      <input name="heroName" type="hidden" value={data.heroProfile.name} />
      <input name="heroDescription" type="hidden" value={data.heroProfile.description} />
      <input name="heroTitles" type="hidden" value={data.heroProfile.titles} />
      <input name="heroAvatarSourceType" type="hidden" value={data.heroProfile.avatarSourceType} />
      <input name="heroAvatarMediaAssetId" type="hidden" value={data.heroProfile.avatarMediaAssetId} />
      <input name="heroAvatarExternalUrl" type="hidden" value={data.heroProfile.avatarExternalUrl} />
      <input name="primaryButtonLabel" type="hidden" value={data.heroProfile.primaryButtonLabel} />
      <input name="primaryButtonHref" type="hidden" value={data.heroProfile.primaryButtonHref} />
      <input name="secondaryButtonLabel" type="hidden" value={data.heroProfile.secondaryButtonLabel} />
      <input name="secondaryButtonHref" type="hidden" value={data.heroProfile.secondaryButtonHref} />
    </>
  );
}

export function highlightMovedItem(focusTarget: string) {
  const element = document.querySelector<HTMLElement>(`[data-focus-target="${focusTarget}"]`);

  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("ring-2", "ring-emerald-400/40", "bg-emerald-500/8");

  const timeout = window.setTimeout(() => {
    element.classList.remove("ring-2", "ring-emerald-400/40", "bg-emerald-500/8");
  }, 1800);

  return () => window.clearTimeout(timeout);
}

export function useContentFocusHighlight({
  flashMessage,
  focusTarget,
  status,
}: {
  flashMessage?: string | null;
  focusTarget?: string;
  status: ContentFormState["status"];
}) {
  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    if (status === "idle" && flashMessage?.includes("排序")) {
      return highlightMovedItem(focusTarget);
    }

    const element = document.querySelector<HTMLElement>(`[data-focus-target="${focusTarget}"]`);

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("ring-2", "ring-cyan-400/40");

    const timeout = window.setTimeout(() => {
      element.classList.remove("ring-2", "ring-cyan-400/40");
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [flashMessage, focusTarget, status]);
}
