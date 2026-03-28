import type { SiteThemeState } from "@/shared/types/site-theme-state";
import { templateRegistry } from "@/templates/registry";
import { TemplateRuntimeMount } from "@/templates/template-runtime-mount";
import type { SiteRenderData, TemplateMode } from "@/templates/types";

export async function SiteRenderer({
  data,
  themeState,
  mode = "published",
}: {
  data: SiteRenderData;
  themeState: SiteThemeState;
  mode?: TemplateMode;
}) {
  const registryEntry = templateRegistry[themeState.templateId as keyof typeof templateRegistry];

  if (!registryEntry) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6">
        <div className="rounded-[var(--radius-xl)] border border-rose-400/20 bg-rose-500/10 p-8 text-center">
          <h1 className="text-2xl font-semibold">Template Not Found</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            当前模板未注册，请检查 `src/templates/registry.ts` 和数据库中的 `template_id`。
          </p>
        </div>
      </div>
    );
  }

  const templateModule = await registryEntry.entry();
  const TemplateEntry = templateModule.default;

  return (
    <TemplateRuntimeMount config={themeState.templateConfig} mode={mode} templateId={themeState.templateId}>
      <TemplateEntry config={themeState.templateConfig} data={data} mode={mode} />
    </TemplateRuntimeMount>
  );
}
