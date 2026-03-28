"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/features/admin/components/logout-button";
import { adminNavigation } from "@/shared/config/admin-nav";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";

export function AdminSidebar({
  userEmail,
  userName,
}: {
  userEmail?: string | null;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  function isActiveLink(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[var(--bg-panel)]/95 p-4 backdrop-blur-xl xl:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs tracking-[0.28em] text-cyan-200 uppercase">myhome</span>
            <h1 className="mt-2 text-lg font-semibold text-white">Creator Workspace</h1>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            onClick={() => setMobilePanelOpen((value) => !value)}
            type="button"
          >
            {mobilePanelOpen ? "收起" : "账号"}
          </button>
        </div>

        <nav aria-label="Admin Mobile" className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {adminNavigation.map((item) => {
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition duration-150",
                  active
                    ? "border-cyan-400/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 text-white shadow-[var(--glow-brand)]"
                    : "border-white/10 bg-white/4 text-[var(--text-secondary)] hover:bg-white/8 hover:text-white",
                )}
                href={item.href}
                onClick={() => setMobilePanelOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {mobilePanelOpen ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Admin Session
                </p>
                <h2 className="mt-2 text-base font-semibold text-white">{userName ?? "Administrator"}</h2>
              </div>
              <Badge tone="success">live</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {userEmail ?? "登录后将显示当前管理员账号信息。"}
            </p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        ) : null}
      </div>

      <aside className="hidden border-b border-white/10 bg-[var(--bg-panel)] p-4 backdrop-blur-xl scrollbar-none xl:sticky xl:top-0 xl:block xl:h-screen xl:overflow-y-auto xl:border-b-0 xl:border-r xl:p-6">
        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-5">
          <span className="font-mono text-xs tracking-[0.28em] text-cyan-200 uppercase">myhome</span>
          <h1 className="mt-3 text-2xl font-semibold text-white">Creator Workspace</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            单站点内容系统、模板中心和媒体库共用同一份结构化数据，保存后直接作用到站点。
          </p>
        </div>

        <nav aria-label="Admin" className="mt-5 grid gap-2">
          {adminNavigation.map((item) => {
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                className={cn(
                  "rounded-[var(--radius-md)] border px-4 py-3 transition duration-150",
                  active
                    ? "border-cyan-400/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 shadow-[var(--glow-brand)]"
                    : "border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/5",
                )}
                href={item.href}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{item.label}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{item.shortLabel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-[0.24em]">
                Admin Session
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">{userName ?? "Administrator"}</h2>
            </div>
            <Badge tone="success">live</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {userEmail ?? "登录后将显示当前管理员账号信息。"}
          </p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
