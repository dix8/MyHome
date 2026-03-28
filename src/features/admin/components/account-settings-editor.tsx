"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveAccountSettingsAction } from "@/features/admin/server/settings-actions";
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

  return <Button size="lg" type="submit">{pending ? "保存中..." : "保存账号设置"}</Button>;
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
            {pending ? "正在保存账号设置..." : status === "error" ? "保存失败" : "你有未保存的更改"}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {pending
              ? "正在写入管理员账号信息。"
              : status === "error"
                ? message ?? "保存失败，请检查账号信息后重试。"
                : "保存后，后台会在下一次请求时显示最新的管理员信息。"}
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
  autoComplete,
  defaultValue,
  label,
  name,
  placeholder,
  type = "text",
}: {
  autoComplete?: string;
  defaultValue: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        autoComplete={autoComplete}
        className="h-12 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

export function AccountSettingsEditor({ data }: { data: Pick<SettingsPageData, "account"> }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveAccountSettingsAction, initialSettingsFormState);
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
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader
            description="这里可以直接修改后台管理员的显示名称、登录邮箱和密码。修改登录邮箱或密码时，需要先填写当前密码。"
            title="管理员账号"
          />
          <div className="mt-5 grid gap-4">
            <Field
              autoComplete="name"
              defaultValue={data.account.displayName}
              label="显示名称"
              name="accountDisplayName"
              placeholder="例如：Admin"
            />
            <Field
              autoComplete="email"
              defaultValue={data.account.email}
              label="登录邮箱"
              name="accountEmail"
              placeholder="admin@example.com"
              type="email"
            />
            <div className="rounded-[var(--radius-md)] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
              如果只改显示名称，不需要填写密码。如果要修改登录邮箱或密码，必须填写当前密码。
            </div>
            <Field
              autoComplete="current-password"
              defaultValue=""
              label="当前密码"
              name="currentPassword"
              placeholder="修改邮箱或密码时必填"
              type="password"
            />
            <Field
              autoComplete="new-password"
              defaultValue=""
              label="新密码"
              name="newPassword"
              placeholder="留空则不修改密码"
              type="password"
            />
            <Field
              autoComplete="new-password"
              defaultValue=""
              label="确认新密码"
              name="confirmNewPassword"
              placeholder="再次输入新密码"
              type="password"
            />
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader description="这里显示当前管理员账号的只读状态信息。" title="账号状态" />
          <div className="mt-5 grid gap-3">
            {[
              ["当前邮箱", data.account.email],
              ["当前显示名称", data.account.displayName],
              ["最后登录时间", data.account.lastLoginAt ?? "暂无记录"],
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
      </div>

      <FloatingSaveBar dirty={isDirty} message={state.message} onReset={handleResetChanges} status={state.status} />
    </form>
  );
}
