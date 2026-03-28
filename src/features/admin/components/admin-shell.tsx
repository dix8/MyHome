import type { ReactNode } from "react";

import { Badge } from "@/shared/ui/badge";

export function AdminShell({
  title,
  description,
  children,
  actions,
  status = "实时",
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  status?: "实时" | "未保存";
}) {
  const tone = status === "未保存" ? "warning" : "success";
  const headerActions = actions ?? null;

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <header className="sticky top-4 z-10 rounded-[var(--radius-xl)] border border-white/10 bg-[var(--bg-panel)] px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur-xl md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-white md:text-3xl">{title}</h1>
              <Badge tone={tone}>{status}</Badge>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>

          <div className="flex flex-wrap gap-3">{headerActions}</div>
        </div>
      </header>

      <div className="mt-6">{children}</div>
    </div>
  );
}
