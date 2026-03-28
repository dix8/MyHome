import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { getSiteMetadataValues } from "@/features/site/server/site-metadata";
import { auth } from "@/server/auth";
import { ensureDefaultAdminUser } from "@/server/auth/default-admin";
import { getDefaultAdminBootstrapConfig } from "@/server/env";
import { Card } from "@/shared/ui/card";

function normalizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/")) {
    return "/admin";
  }

  return callbackUrl;
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle } = await getSiteMetadataValues();

  return {
    title: `后台登录 | ${siteTitle}`,
  };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = normalizeCallbackUrl(params?.callbackUrl);
  const defaultAdminConfig = getDefaultAdminBootstrapConfig();

  if (session) {
    redirect(callbackUrl);
  }

  await ensureDefaultAdminUser();

  return (
    <main className="grid min-h-screen bg-[var(--bg-base)] lg:grid-cols-[1.05fr_minmax(420px,0.95fr)]">
      <section className="hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="max-w-xl">
          <span className="font-mono text-xs tracking-[0.28em] text-cyan-200 uppercase">myhome</span>
          <h1 className="mt-6 text-5xl leading-none font-semibold tracking-tight text-white">
            个人主页内容管理工作台。
          </h1>
          <p className="mt-6 text-base leading-8 text-[var(--text-secondary)]">
            在这里统一维护站点内容、模板样式、媒体资源和管理员账户。保存后的更新会直接反映到前台页面。
          </p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-white/10 bg-white/4 p-6 backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
            Secure Access
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            仅管理员可访问后台。首次进入时如果系统还没有管理员账号，会自动完成初始化。
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <Card className="w-full max-w-md rounded-[32px] p-7 md:p-8">
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-[0.28em] text-cyan-200 uppercase">
              Admin Login
            </span>
            <h2 className="text-3xl font-semibold text-white">后台登录</h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              使用管理员账号登录后即可进入内容工作台。首次访问时如果系统还没有管理员账号，会自动完成初始化。
            </p>
          </div>

          <AdminLoginForm callbackUrl={callbackUrl} initialError={params?.error} />

          <div className="mt-5 rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4">
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {defaultAdminConfig?.source === "development-default"
                ? "当前环境已启用默认管理员初始化：admin@example.com / Admin123456!。首次登录后建议立即在后台修改账号信息。"
                : "系统已启用首次管理员初始化。若需要自定义默认管理员，请在环境变量中设置 DEFAULT_ADMIN_EMAIL、DEFAULT_ADMIN_NAME、DEFAULT_ADMIN_PASSWORD。"}
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
