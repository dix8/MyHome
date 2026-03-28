import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { getDashboardPageData } from "@/features/admin/server/dashboard";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "总览",
};

export default async function AdminDashboardPage() {
  const data = await getDashboardPageData();

  return (
    <AdminShell
      actions={<Badge tone="success">live site</Badge>}
      description="Dashboard 现在直接聚合当前站点数据、当前模板和最近动作。所有内容保存后都会直接作用到首页。"
      status="实时"
      title="Dashboard"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="grid gap-5">
          <Card>
            <CardHeader
              action={<Badge tone="brand">{data.currentTemplate.id}</Badge>}
              description={`当前管理员：${data.account.displayName} / ${data.account.email}`}
              title="欢迎回来"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.stats.map((item) => (
                <div key={item.label} className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 p-4">
                  <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">{item.hint}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader
                description="模板中心和首页现在共用同一份模板状态，切换并保存后会立即反映到站点。"
                title="当前模板"
              />
              <div className="mt-5 rounded-[var(--radius-lg)] border border-cyan-400/20 bg-linear-to-br from-cyan-400/10 via-blue-500/8 to-violet-500/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{data.currentTemplate.name}</h3>
                  <Badge tone="success">live</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{data.currentTemplate.description}</p>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">模板 ID：{data.currentTemplate.id}</p>
              </div>
            </Card>

            <Card>
              <CardHeader description="这里直接读取 activity_logs，不再是静态列表。" title="最近动作" />
              <div className="mt-5 grid gap-3">
                {data.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs text-[var(--text-muted)]">{item.action}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.createdAt}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/82">{item.summary}</p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{item.userName ?? "未知管理员"}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader
            description="这里显示当前首页会直接读取的站点内容摘要。"
            title="当前站点"
          />
          <div className="mt-5 rounded-[28px] border border-white/10 bg-[#081120] p-5">
            <div className="rounded-[24px] border border-cyan-400/20 bg-linear-to-br from-cyan-400/8 to-violet-500/8 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">site / live</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">{data.currentSite.data.hero.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{data.currentSite.data.hero.description}</p>
              <div className="mt-5 grid gap-3">
                {data.currentSite.data.sections
                  .filter((section) => section.isEnabled)
                  .map((section) => (
                    <div
                      key={section.key}
                      className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">{section.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            现在没有单独的发布步骤。内容、模板和设置保存后，首页会在下一次请求时直接显示最新版本。
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
