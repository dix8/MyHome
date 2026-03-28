import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { TemplateDraftEditor } from "@/features/admin/components/template-draft-editor";
import { getTemplatesPageData } from "@/features/admin/server/templates";
import { SiteRenderer } from "@/features/site/components/site-renderer";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "模板",
};

export default async function TemplatesPage() {
  const data = await getTemplatesPageData();

  return (
    <AdminShell
      actions={<Badge tone="brand">live theme</Badge>}
      description="模板中心现在已经接通真实主题状态。你可以切换模板并按 schema 修改配置，保存后首页会直接读取最新模板。"
      status="实时"
      title="Templates"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
          <TemplateDraftEditor
            key={`${data.currentThemeState.templateId}:${JSON.stringify(data.currentThemeState.templateConfig)}`}
            templates={data.templates}
            themeState={data.currentThemeState}
          />

          <div className="grid gap-5 xl:sticky xl:top-24">
            <Card className="h-fit overflow-hidden">
              <CardHeader
                action={<Badge tone="brand">{data.currentThemeState.templateId}</Badge>}
                description={`当前管理员：${data.account.displayName} / ${data.account.email}。右侧展示的是数据库中的当前模板，切换模板后需要保存才会同步到这里。`}
                title="当前站点预览"
              />
              <div className="mt-5 rounded-[32px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_42%),linear-gradient(180deg,rgba(8,15,28,0.95),rgba(5,9,19,1))] p-3">
                <div className="rounded-[28px] border border-white/10 bg-[#050913] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.32)]">
                  <div className="aspect-[10/16] overflow-hidden rounded-[24px] border border-white/10 bg-[#030712]">
                    <div className="origin-top-left scale-[0.3]" style={{ width: "333.3334%" }}>
                      <SiteRenderer data={data.currentSite} mode="preview" themeState={data.currentThemeState} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                这是当前站点的缩略视图。保存模板配置后，首页会在下一次请求时直接显示最新效果。
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
