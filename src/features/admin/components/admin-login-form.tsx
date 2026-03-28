"use client";

import { useState, useTransition } from "react";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";

function normalizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return "/admin";
  }

  return callbackUrl;
}

function resolveErrorMessage(error?: string | null) {
  if (!error) {
    return null;
  }

  if (error === "CredentialsSignin") {
    return "邮箱或密码错误。";
  }

  return "登录失败，请检查配置后重试。";
}

export function AdminLoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(resolveErrorMessage(initialError));
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "");
        const password = String(form.get("password") ?? "");
        const nextPath = normalizeCallbackUrl(callbackUrl);

        startTransition(async () => {
          setErrorMessage(null);

          const result = await signIn("credentials", {
            email,
            password,
            callbackUrl: nextPath,
            redirect: false,
          });

          if (!result || result.error) {
            setErrorMessage(resolveErrorMessage(result?.error) ?? "登录失败，请稍后再试。");
            return;
          }

          router.push(nextPath);
          router.refresh();
        });
      }}
    >
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">邮箱</span>
        <input
          className="h-12 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          name="email"
          placeholder="请输入邮箱"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">密码</span>
        <input
          className="h-12 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
          name="password"
          placeholder="请输入管理员密码"
          required
          type="password"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-[var(--radius-sm)] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </p>
      ) : null}

      <Button className="mt-2 w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "登录中..." : "进入后台"}
      </Button>
    </form>
  );
}
