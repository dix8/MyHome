"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import {
  getDefaultTemplateConfig,
  type TemplateDefinition,
  type TemplatesFormState,
} from "@/features/admin/lib/template-draft";
import { saveTemplateDraftAction } from "@/features/admin/server/template-actions";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";
import { FormSelect } from "@/shared/ui/form-select";
import type { SiteThemeState } from "@/shared/types/site-theme-state";
import type { TemplateConfig, TemplateField } from "@/templates/types";

const initialTemplatesFormState: TemplatesFormState = {
  status: "idle",
  message: null,
};

const templatePositioning = {
  "glow-vision": {
    label: "主力霓虹",
    summary: "适合更强视觉冲击和个人品牌展示。",
    tone: "success" as const,
  },
  "minimal-card": {
    label: "简约编辑",
    summary: "适合更克制、成熟、偏内容阅读的个人主页。",
    tone: "neutral" as const,
  },
  "neon-tech": {
    label: "稳态科技",
    summary: "适合更专业、产品化、强调秩序感的展示风格。",
    tone: "brand" as const,
  },
  "signal-grid": {
    label: "未来控制台",
    summary: "适合更强未来感、系统界面和 HUD 气质。",
    tone: "warning" as const,
  },
} as const;

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} size="lg" type="submit">
      {pending ? "保存中..." : "保存模板"}
    </Button>
  );
}

function FieldControl({
  field,
  config,
}: {
  field: TemplateField;
  config: TemplateConfig;
}) {
  if (field.type === "group") {
    return (
      <div className="grid gap-4 rounded-[var(--radius-md)] border border-white/10 bg-black/10 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">{field.label}</p>
          {field.description ? (
            <p className="text-xs leading-5 text-[var(--text-secondary)]">{field.description}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {field.fields.map((child) => (
            <FieldControl key={child.key} config={config} field={child} />
          ))}
        </div>
      </div>
    );
  }

  const defaultValue = config[field.key] ?? field.defaultValue;

  switch (field.type) {
    case "text":
    case "color":
      return (
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--text-secondary)]">{field.label}</span>
          <input
            className="h-12 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
            defaultValue={String(defaultValue)}
            name={field.key}
            placeholder={field.placeholder}
            type={field.type === "color" ? "color" : "text"}
          />
          {field.description ? <p className="text-xs text-[var(--text-muted)]">{field.description}</p> : null}
        </label>
      );
    case "textarea":
      return (
        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="text-[var(--text-secondary)]">{field.label}</span>
          <textarea
            className="min-h-28 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
            defaultValue={String(defaultValue)}
            name={field.key}
            placeholder={field.placeholder}
            rows={4}
          />
          {field.description ? <p className="text-xs text-[var(--text-muted)]">{field.description}</p> : null}
        </label>
      );
    case "switch":
      return (
        <label className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">{field.label}</p>
            {field.description ? <p className="text-xs leading-5 text-[var(--text-secondary)]">{field.description}</p> : null}
          </div>
          <input
            className="mt-1 h-5 w-5 rounded border-white/20 bg-transparent accent-cyan-400"
            defaultChecked={Boolean(defaultValue)}
            name={field.key}
            type="checkbox"
          />
        </label>
      );
    case "number":
    case "slider":
      return (
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--text-secondary)]">{field.label}</span>
          <input
            className="h-12 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 outline-none transition focus:border-cyan-400/30 focus:bg-white/8"
            defaultValue={Number(defaultValue)}
            max={field.max}
            min={field.min}
            name={field.key}
            step={field.step}
            type="number"
          />
          {field.description ? <p className="text-xs text-[var(--text-muted)]">{field.description}</p> : null}
        </label>
      );
    case "select":
      return (
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--text-secondary)]">{field.label}</span>
          <FormSelect
            defaultValue={String(defaultValue)}
            key={`${field.key}:${String(defaultValue)}`}
            name={field.key}
            options={field.options}
          />
          {field.description ? <p className="text-xs text-[var(--text-muted)]">{field.description}</p> : null}
        </label>
      );
  }
}

function TemplateArtwork({
  cover,
  selected,
}: {
  cover: string;
  selected: boolean;
}) {
  if (cover === "linen-card") {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-black/8 bg-[linear-gradient(145deg,#efe6d9_0%,#d7ddd2_48%,#95aa9a_100%)] text-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_35%)]" />
        <div className="absolute inset-6 rounded-[18px] border border-slate-900/10 bg-white/55 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-700/70">linen card</p>
          <div className="mt-4 grid gap-3">
            <div className="h-3 w-24 rounded-full bg-slate-900/18" />
            <div className="h-8 rounded-2xl bg-slate-900/10" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded-2xl bg-white/72" />
              <div className="h-16 rounded-2xl bg-white/60" />
            </div>
          </div>
        </div>
        {selected ? <div className="absolute inset-0 ring-1 ring-cyan-400/35 ring-inset" /> : null}
      </div>
    );
  }

  if (cover === "glow-console") {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[linear-gradient(180deg,#0a0a1a_0%,#0f0f2a_100%)] text-white">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_14%_20%,rgba(0,240,255,0.85)_0_2px,transparent_3px),radial-gradient(circle_at_82%_14%,rgba(124,58,237,0.85)_0_2px,transparent_3px),radial-gradient(circle_at_66%_72%,rgba(255,255,255,0.75)_0_2px,transparent_3px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(0,240,255,0.16),transparent_28%),radial-gradient(circle_at_82%_100%,rgba(124,58,237,0.18),transparent_36%)]" />
        <div className="absolute inset-5 rounded-[20px] border border-cyan-300/14 bg-[#09101f]/78 p-4 shadow-[0_24px_50px_rgba(0,240,255,0.12)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/70">glow vision</p>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-violet-300/55" />
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="mx-auto h-14 w-14 rounded-full border-[3px] border-cyan-300/85 bg-[linear-gradient(135deg,rgba(0,240,255,0.22),rgba(124,58,237,0.38))] shadow-[0_0_30px_rgba(0,240,255,0.18)]" />
            <div className="mx-auto h-3 w-20 rounded-full bg-cyan-300/55" />
            <div className="mx-auto h-9 w-28 rounded-[14px] bg-[linear-gradient(135deg,#00d4ff_0%,#4f8cff_30%,#7c3aed_70%,#a855f7_100%)] opacity-90" />
            <div className="mx-auto flex items-center gap-2">
              <div className="h-2.5 w-2 rounded-full bg-cyan-300" />
              <div className="h-2.5 w-24 rounded-full bg-white/16" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-14 rounded-[16px] border border-cyan-300/12 bg-white/[0.04]" />
              <div className="h-14 rounded-[16px] border border-violet-300/12 bg-white/[0.05]" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-8 flex-1 rounded-[12px] bg-[linear-gradient(135deg,#00f0ff,#7c3aed)] opacity-85" />
              <div className="h-8 flex-1 rounded-[12px] border border-cyan-300/55 bg-transparent" />
            </div>
          </div>
        </div>
        {selected ? <div className="absolute inset-0 ring-1 ring-cyan-400/35 ring-inset" /> : null}
      </div>
    );
  }

  if (cover === "signal-grid") {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[linear-gradient(180deg,#06080d_0%,#0b111a_100%)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(110,231,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,255,0.14)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />
        <div className="absolute inset-5 border border-cyan-200/16 bg-slate-950/55 p-4 shadow-[0_24px_50px_rgba(110,231,255,0.14)] backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/70">signal grid</p>
          <div className="mt-4 grid gap-3">
            <div className="h-3 w-24 rounded-full bg-cyan-300/35" />
            <div className="h-10 w-32 rounded-none border border-cyan-300/18 bg-white/4" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-14 border border-cyan-300/12 bg-cyan-400/8" />
              <div className="h-14 border border-white/10 bg-white/4" />
              <div className="h-14 border border-orange-300/12 bg-orange-400/8" />
            </div>
          </div>
        </div>
        {selected ? <div className="absolute inset-0 ring-1 ring-cyan-400/35 ring-inset" /> : null}
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-cyan-300/10 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.28),transparent_22%),radial-gradient(circle_at_82%_0%,rgba(168,85,247,0.32),transparent_28%),linear-gradient(155deg,#09111f_0%,#0e2538_48%,#080d17_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-6 rounded-[18px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_24px_50px_rgba(6,182,212,0.16)] backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/70">aurora grid</p>
        <div className="mt-4 grid gap-3">
          <div className="h-3 w-28 rounded-full bg-cyan-300/35" />
          <div className="h-8 rounded-2xl bg-white/8" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-14 rounded-2xl bg-cyan-400/10" />
            <div className="h-14 rounded-2xl bg-white/6" />
            <div className="h-14 rounded-2xl bg-violet-400/12" />
          </div>
        </div>
      </div>
      {selected ? <div className="absolute inset-0 ring-1 ring-cyan-400/35 ring-inset" /> : null}
    </div>
  );
}

export function TemplateDraftEditor({
  templates,
  themeState,
}: {
  templates: TemplateDefinition[];
  themeState: SiteThemeState;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveTemplateDraftAction, initialTemplatesFormState);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [hasFormEdits, setHasFormEdits] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  const selectedTemplateId = pendingTemplateId ?? themeState.templateId;

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.manifest.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const selectedConfig = useMemo(() => {
    if (!selectedTemplate) {
      return {};
    }

    if (selectedTemplate.manifest.id === themeState.templateId) {
      return {
        ...getDefaultTemplateConfig(selectedTemplate.manifest, selectedTemplate.schema),
        ...themeState.templateConfig,
      };
    }

    return getDefaultTemplateConfig(selectedTemplate.manifest, selectedTemplate.schema);
  }, [selectedTemplate, themeState.templateConfig, themeState.templateId]);

  const hasPendingSelection = pendingTemplateId !== null && pendingTemplateId !== themeState.templateId;
  const isDirty = state.status === "success" ? false : hasPendingSelection || hasFormEdits;
  const selectionDiffersFromDraft = selectedTemplate?.manifest.id !== themeState.templateId;
  const statusTone =
    state.status === "error"
      ? "danger"
      : isDirty || selectionDiffersFromDraft
        ? "warning"
        : state.status === "success"
          ? "success"
          : "neutral";

  const statusText =
    state.status === "error"
      ? state.message ?? "保存失败，请检查模板配置。"
      : selectionDiffersFromDraft
      ? "你已经切换了待保存模板，右侧预览仍然显示当前站点版本。保存后预览会同步。"
        : isDirty
          ? "你已经修改了模板配置，但还没有保存。"
          : state.status === "success"
            ? state.message ?? "模板已保存。"
            : "当前模板和配置已同步。";

  return (
    <form action={formAction} className="grid gap-5" onChange={() => setHasFormEdits(true)}>
      <Card>
        <CardHeader
          description="把模板选择、状态和保存动作收敛在同一个工作台里，减少左右来回切换。"
          title="模板工作台"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto]">
          <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">current theme</p>
            <p className="mt-2 text-base font-semibold text-white">{themeState.templateId}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">当前数据库里的模板状态，右侧预览正在读取这一版。</p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">current selection</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-white">{selectedTemplate?.manifest.name ?? "未选择模板"}</p>
              {selectionDiffersFromDraft ? <Badge tone="warning">pending save</Badge> : <Badge tone="brand">in sync</Badge>}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {selectedTemplate?.manifest.description ?? "当前没有选中的模板。"}
            </p>
          </div>

          <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/4 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">status</p>
              <Badge tone={statusTone}>{state.status === "error" ? "error" : isDirty || selectionDiffersFromDraft ? "unsaved" : "ready"}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{statusText}</p>
            {selectedTemplate ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTemplate.manifest.supportedSections.map((section) => (
                  <Badge key={section}>{section}</Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-stretch">
            <SubmitButton className="w-full min-w-[180px]" />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          description="模板已按推荐定位排序：主力霓虹、稳态科技、简约编辑、未来控制台。先选模板，再调整对应 schema 配置。"
          title="模板列表"
        />
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {templates.map((template) => {
            const activeDraft = template.manifest.id === themeState.templateId;
            const selected = template.manifest.id === selectedTemplateId;
            const positioning =
              templatePositioning[template.manifest.id as keyof typeof templatePositioning];

            return (
              <button
                key={template.manifest.id}
                className={`overflow-hidden rounded-[30px] border text-left transition ${
                  selected
                    ? "border-cyan-400/24 bg-linear-to-br from-cyan-400/10 via-blue-500/8 to-sky-500/6 shadow-[var(--glow-brand)]"
                    : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6"
                }`}
                onClick={() => {
                  setPendingTemplateId(template.manifest.id === themeState.templateId ? null : template.manifest.id);
                }}
                type="button"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/55">{template.manifest.cover}</p>
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{template.manifest.name}</h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{template.manifest.description}</p>
                        {positioning ? (
                          <p className="mt-2 text-sm leading-6 text-white/68">{positioning.summary}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {positioning ? <Badge tone={positioning.tone}>{positioning.label}</Badge> : null}
                      {activeDraft ? <Badge tone="success">current</Badge> : null}
                      {selected ? <Badge tone="brand">selected</Badge> : null}
                      <Badge tone="neutral">v{template.manifest.version}</Badge>
                    </div>
                  </div>
                  <div className="mt-5">
                    <TemplateArtwork cover={template.manifest.cover} selected={selected} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.manifest.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedTemplate ? (
        <Card key={selectedTemplate.manifest.id}>
          <CardHeader
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">{selectedTemplate.manifest.id}</Badge>
                <Badge tone="neutral">schema driven</Badge>
              </div>
            }
            description="配置项来自模板自身的 `schema.ts`。保存后首页会直接读取这里的最新模板配置。"
            title={`模板配置 · ${selectedTemplate.manifest.name}`}
          />
          <input name="templateId" type="hidden" value={selectedTemplate.manifest.id} />
          <div className="mt-5 grid gap-5">
            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">supported sections</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTemplate.manifest.supportedSections.map((section) => (
                  <Badge key={section} tone="brand">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedTemplate.schema.sections.map((section) => (
              <section
                key={section.key}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-5"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                  {section.description ? (
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{section.description}</p>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldControl key={field.key} config={selectedConfig} field={field} />
                  ))}
                </div>
              </section>
            ))}

            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </div>
        </Card>
      ) : null}
    </form>
  );
}
