"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveSiteSettingsAction } from "@/features/admin/server/settings-actions";
import type { SettingsFormState, SettingsPageData } from "@/features/admin/server/settings";
import { captureFormSnapshot, formMatchesSnapshot, restoreFormSnapshot } from "@/shared/lib/form-snapshot";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";

const initialSettingsFormState: SettingsFormState = {
  status: "idle",
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button size="lg" type="submit">{pending ? "保存中..." : "保存站点设置"}</Button>;
}

function FloatingSaveBar({
  dirty,
  message,
  status,
  onReset,
}: {
  dirty: boolean;
  message: string | null;
  status: SettingsFormState["status"];
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
          <p className="text-sm font-medium text-white">
            {pending ? "正在保存站点设置..." : status === "error" ? "保存失败" : "你有未保存的更改"}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {pending
              ? "正在把站点设置写入数据库。"
              : status === "error"
                ? message ?? "保存失败，请检查当前表单内容后重试。"
                : "保存后，首页和后台相关页面会在下一次请求时直接显示最新内容。"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button disabled={pending} onClick={onReset} type="button" variant="secondary">
            撤销更改
          </Button>
          <SubmitButton />
        </div>
      </div>
    </div>
  );
}

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  textarea = false,
  rows = 4,
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      {textarea ? (
        <textarea
          className="min-h-28 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          type="text"
        />
      )}
    </label>
  );
}

export function SettingsEditor({ data }: { data: Pick<SettingsPageData, "siteSettings"> }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialSettingsFormState);
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
    if (state.status !== "success") {
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
  }, [router, state.status]);

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

  return (
    <form action={formAction} className="grid gap-5" onChange={handleFormChange} ref={formRef}>
      <Card>
        <CardHeader
          description="这部分会直接更新 `site_settings`，保存后首页和 Dashboard 会读取最新值。"
          title="站点信息 / SEO"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            defaultValue={data.siteSettings.siteName}
            label="站点名称"
            name="siteName"
            placeholder="例如：Kek's Workspace"
          />
          <Field
            defaultValue={data.siteSettings.siteSubtitle}
            label="站点副标题"
            name="siteSubtitle"
            placeholder="一句简短定位"
          />
          <Field
            defaultValue={data.siteSettings.seoTitle}
            label="SEO 标题"
            name="seoTitle"
            placeholder="用于搜索引擎标题"
          />
          <Field
            defaultValue={data.siteSettings.icpUrl}
            label="备案链接"
            name="icpUrl"
            placeholder="https://beian.miit.gov.cn/"
          />
          <div className="md:col-span-2">
            <Field
              defaultValue={data.siteSettings.seoDescription}
              label="SEO 描述"
              name="seoDescription"
              placeholder="用于搜索引擎描述"
              rows={4}
              textarea
            />
          </div>
          <div className="md:col-span-2">
            <Field
              defaultValue={data.siteSettings.seoKeywords}
              label="SEO 关键词"
              name="seoKeywords"
              placeholder="多个关键词用英文逗号分隔"
            />
          </div>
          <div className="md:col-span-2">
            <Field
              defaultValue={data.siteSettings.footerText}
              label="页脚文案"
              name="footerText"
              placeholder="页脚展示文案"
            />
          </div>
          <div className="md:col-span-2">
            <Field
              defaultValue={data.siteSettings.icpText}
              label="备案文案"
              name="icpText"
              placeholder="例如：粤ICP备xxxx号"
            />
          </div>
        </div>
      </Card>

      <FloatingSaveBar dirty={isDirty} message={state.message} onReset={handleResetChanges} status={state.status} />
    </form>
  );
}
