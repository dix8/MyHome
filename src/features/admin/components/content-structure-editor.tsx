"use client";

import { useActionState } from "react";

import type { ContentPageData } from "@/features/admin/server/content";
import { saveContentAction } from "@/features/admin/server/content-actions";
import type { ContentFormState } from "@/features/admin/server/content";
import {
  ContentContextRail,
  ContentFloatingSaveBar,
  ContentItemHeader,
  ContentMoveButtons,
  ContentToggleField,
  HiddenHeroFields,
  initialContentFormState,
  useContentDirtyForm,
  useContentFocusHighlight,
} from "@/features/admin/components/content-form-shared";
import { Badge } from "@/shared/ui/badge";
import { Card, CardHeader } from "@/shared/ui/card";

export function ContentStructureEditor({
  data,
  flashMessage,
  focusTarget,
}: {
  data: ContentPageData;
  flashMessage?: string | null;
  focusTarget?: string;
}) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(saveContentAction, initialContentFormState);
  const { formRef, handleFormChange, handleResetChanges, isDirty } = useContentDirtyForm({
    data,
    status: state.status,
  });

  useContentFocusHighlight({
    flashMessage,
    focusTarget,
    status: state.status,
  });

  return (
    <form
      action={formAction}
      className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]"
      onChange={handleFormChange}
      ref={formRef}
    >
      <div className="grid gap-5">
        <HiddenHeroFields data={data} />
        <Card>
          <CardHeader
            action={
              <Badge className="shrink-0 whitespace-nowrap px-3 py-1.5" tone="neutral">
                {data.sections.length} 个模块
              </Badge>
            }
            description="这里定义首页各个模块的显示状态，并通过上移 / 下移调整整体顺序。"
            title="页面结构"
          />
          <div className="mt-5 grid gap-3">
            <input name="footerSectionId" type="hidden" value={data.footerSectionId ?? ""} />
            {data.sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4"
                data-focus-target={`section:${section.id}`}
              >
                <input name="sectionIds" type="hidden" value={section.id} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <ContentItemHeader
                    enabled={section.isEnabled}
                    indexLabel={`第 ${index + 1} 个`}
                    title={section.title}
                  />
                  <ContentMoveButtons
                    disableDown={index === data.sections.length - 1}
                    disableUp={index === 0}
                    disabled={isDirty}
                    target={`section:${section.id}`}
                  />
                </div>
                <div className="mt-4">
                  <ContentToggleField
                    defaultChecked={section.isEnabled}
                    description="关闭后，这个模块不会在首页显示。"
                    label={`显示 ${section.title}`}
                    name={`section-enabled-${section.id}`}
                  />
                </div>
              </div>
            ))}

            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4">
              <ContentToggleField
                defaultChecked={data.showAdminShortcut}
                description="关闭后，首页右下角的“打开后台”快捷入口会被隐藏。"
                label="显示右下角后台入口"
                name="showAdminShortcut"
              />
            </div>
          </div>
        </Card>
      </div>

      <ContentContextRail data={data} flashMessage={flashMessage} />
      <ContentFloatingSaveBar dirty={isDirty} message={state.message} onReset={handleResetChanges} />
    </form>
  );
}
