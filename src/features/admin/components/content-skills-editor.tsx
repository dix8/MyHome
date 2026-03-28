"use client";

import { useActionState } from "react";

import { ConfirmActionButton } from "@/features/admin/components/confirm-action-button";
import type { ContentFormState, ContentPageData } from "@/features/admin/server/content";
import {
  addSkillGroupAction,
  addSkillItemAction,
  deleteSkillGroupAction,
  deleteSkillItemAction,
  saveContentAction,
} from "@/features/admin/server/content-actions";
import {
  ContentContextRail,
  ContentFloatingSaveBar,
  ContentItemHeader,
  ContentMoveButtons,
  ContentTextField,
  ContentToggleField,
  HiddenHeroFields,
  initialContentFormState,
  useContentDirtyForm,
  useContentFocusHighlight,
} from "@/features/admin/components/content-form-shared";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";

export function ContentSkillsEditor({
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
              <div className="flex items-center gap-3">
                <Badge tone="neutral">{data.skillGroups.length} 个分组</Badge>
                <Button disabled={isDirty} formAction={addSkillGroupAction} type="submit" variant="secondary">
                  新增技能分组
                </Button>
              </div>
            }
            description="技能分组和技能项在这一页集中维护。"
            title="技能"
          />
          <div className="mt-5 grid gap-4">
            {data.skillGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-4"
                data-focus-target={`skill-group:${group.id}`}
              >
                <input name="skillGroupIds" type="hidden" value={group.id} />
                <input name={`skill-group-sortOrder-${group.id}`} type="hidden" value={String(group.sortOrder)} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <ContentItemHeader
                    enabled={group.isEnabled}
                    indexLabel={`第 ${groupIndex + 1} 组`}
                    title={group.title || "未命名分组"}
                  />
                  <ContentMoveButtons
                    disableDown={groupIndex === data.skillGroups.length - 1}
                    disableUp={groupIndex === 0}
                    disabled={isDirty}
                    target={`skill-group:${group.id}`}
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2 md:[&>*]:min-w-0">
                  <ContentTextField
                    defaultValue={group.title}
                    label="分组名称"
                    name={`skill-group-title-${group.id}`}
                    placeholder="例如：前端开发"
                  />
                  <ContentTextField
                    defaultValue={group.subtitle}
                    label="分组副标题"
                    name={`skill-group-subtitle-${group.id}`}
                    placeholder="例如：响应式界面、设计系统、交互实现"
                  />
                </div>
                <div className="mt-4">
                  <ContentToggleField
                    defaultChecked={group.isEnabled}
                    description="关闭后整个技能分组不会在前台显示。"
                    label="启用该分组"
                    name={`skill-group-enabled-${group.id}`}
                  />
                </div>

                <div className="mt-4 grid gap-2.5">
                  {group.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="rounded-[var(--radius-md)] border border-white/10 bg-black/10 px-4 py-3.5"
                      data-focus-target={`skill-item:${item.id}`}
                    >
                      <input name="skillItemIds" type="hidden" value={item.id} />
                      <input name={`skill-item-sortOrder-${item.id}`} type="hidden" value={String(item.sortOrder)} />
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <ContentItemHeader
                          enabled={item.isEnabled}
                          indexLabel={`第 ${itemIndex + 1} 项`}
                          title={item.name || "未命名技能项"}
                        />
                        <ContentMoveButtons
                          disableDown={itemIndex === group.items.length - 1}
                          disableUp={itemIndex === 0}
                          disabled={isDirty}
                          target={`skill-item:${item.id}`}
                        />
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2 md:[&>*]:min-w-0">
                        <ContentTextField
                          defaultValue={item.name}
                          label="技能项"
                          name={`skill-item-name-${item.id}`}
                          placeholder="例如：Next.js"
                        />
                        <ContentTextField
                          defaultValue={item.level}
                          label="熟练度"
                          name={`skill-item-level-${item.id}`}
                          placeholder="0-100，可留空"
                        />
                      </div>
                      <div className="mt-3">
                        <ContentToggleField
                          defaultChecked={item.isEnabled}
                          description="关闭后该技能项不会在前台显示。"
                          label="启用该技能项"
                          name={`skill-item-enabled-${item.id}`}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap justify-between gap-2">
                        <Button disabled={isDirty} formAction={addSkillItemAction.bind(null, group.id)} type="submit" variant="secondary">
                          在本组新增技能项
                        </Button>
                        <ConfirmActionButton
                          confirmLabel="确认删除技能项"
                          confirmText="删除后该技能项会从当前分组中移除，确定继续吗？"
                          disabled={isDirty}
                          formAction={deleteSkillItemAction.bind(null, item.id)}
                          variant="danger"
                        >
                          删除技能项
                        </ConfirmActionButton>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <ConfirmActionButton
                    confirmLabel="确认删除分组"
                    confirmText="删除技能分组会同时删除其中所有技能项，确定继续吗？"
                    disabled={isDirty}
                    formAction={deleteSkillGroupAction.bind(null, group.id)}
                    variant="danger"
                  >
                    删除技能分组
                  </ConfirmActionButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ContentContextRail data={data} flashMessage={flashMessage} />
      <ContentFloatingSaveBar dirty={isDirty} message={state.message} onReset={handleResetChanges} />
    </form>
  );
}
