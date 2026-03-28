"use client";

import { useActionState, useState } from "react";

import { ConfirmActionButton } from "@/features/admin/components/confirm-action-button";
import type { ContentFormState, ContentPageData } from "@/features/admin/server/content";
import { addProjectAction, deleteProjectAction, saveContentAction } from "@/features/admin/server/content-actions";
import {
  ContentContextRail,
  ContentFloatingSaveBar,
  ContentImagePreview,
  ContentItemHeader,
  ContentMediaSelectField,
  ContentMoveButtons,
  ContentSelectField,
  ContentTextField,
  ContentToggleField,
  HiddenHeroFields,
  initialContentFormState,
  resolveMediaUrl,
  useContentDirtyForm,
  useContentFocusHighlight,
} from "@/features/admin/components/content-form-shared";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader } from "@/shared/ui/card";

export function ContentProjectsEditor({
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
  const [projectVisualState, setProjectVisualState] = useState(
    Object.fromEntries(
      data.projects.map((project) => [
        project.id,
        {
          coverExternalUrl: project.coverExternalUrl,
          coverMediaAssetId: project.coverMediaAssetId,
          coverSourceType: project.coverSourceType,
          visualType: project.visualType,
        },
      ]),
    ) as Record<
      string,
      {
        coverExternalUrl: string;
        coverMediaAssetId: string;
        coverSourceType: "none" | "local" | "external";
        visualType: "icon" | "cover";
      }
    >,
  );

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
                <Badge tone="neutral">{data.projects.length} 个项目</Badge>
                <Button disabled={isDirty} formAction={addProjectAction} type="submit" variant="secondary">
                  新增项目
                </Button>
              </div>
            }
            description="项目内容、展示方式和状态集中维护在这一页。"
            title="项目"
          />
          <div className="mt-5 grid gap-4">
            {data.projects.map((project, index) => (
              <div
                key={project.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 px-4 py-3.5"
                data-focus-target={`project:${project.id}`}
              >
                {(() => {
                  const visualState = projectVisualState[project.id] ?? {
                    coverExternalUrl: project.coverExternalUrl,
                    coverMediaAssetId: project.coverMediaAssetId,
                    coverSourceType: project.coverSourceType,
                    visualType: project.visualType,
                  };
                  const previewUrl =
                    visualState.visualType === "cover"
                      ? visualState.coverSourceType === "local"
                        ? resolveMediaUrl(data.mediaOptions, visualState.coverMediaAssetId)
                        : visualState.coverSourceType === "external"
                          ? visualState.coverExternalUrl
                          : ""
                      : "";

                  return (
                    <>
                <input name="projectIds" type="hidden" value={project.id} />
                <input name={`project-sortOrder-${project.id}`} type="hidden" value={String(project.sortOrder)} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <ContentItemHeader
                    enabled={project.isEnabled}
                    indexLabel={`第 ${index + 1} 个`}
                    title={project.title || "未命名项目"}
                  />
                  <ContentMoveButtons
                    disableDown={index === data.projects.length - 1}
                    disableUp={index === 0}
                    disabled={isDirty}
                    target={`project:${project.id}`}
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 md:[&>*]:min-w-0">
                  <ContentTextField
                    defaultValue={project.title}
                    label="项目名称"
                    name={`project-title-${project.id}`}
                    placeholder="例如：Creator Admin Workspace"
                  />
                  <ContentTextField
                    defaultValue={project.techStack}
                    label="技术栈"
                    name={`project-techStack-${project.id}`}
                    placeholder="多个技术项用英文逗号分隔"
                  />
                  <div className="md:col-span-2">
                    <ContentTextField
                      defaultValue={project.description}
                      label="项目简介"
                      name={`project-description-${project.id}`}
                      placeholder="说明项目做了什么。"
                      rows={4}
                      textarea
                    />
                  </div>
                  <ContentSelectField
                    defaultValue={visualState.visualType}
                    label="展示形式"
                    name={`project-visualType-${project.id}`}
                    onValueChange={(value) =>
                      setProjectVisualState((current) => ({
                        ...current,
                        [project.id]: {
                          ...visualState,
                          visualType: (value as "icon" | "cover") ?? project.visualType,
                        },
                      }))
                    }
                    options={[
                      { label: "图标", value: "icon" },
                      { label: "封面", value: "cover" },
                    ]}
                  />
                  {visualState.visualType === "icon" ? (
                    <ContentTextField
                      defaultValue={project.iconName}
                      label="图标名"
                      name={`project-iconName-${project.id}`}
                      placeholder="例如：layout-dashboard"
                    />
                  ) : (
                    <>
                      <ContentSelectField
                        defaultValue={visualState.coverSourceType}
                        label="封面来源"
                        name={`project-coverSourceType-${project.id}`}
                        onValueChange={(value) =>
                          setProjectVisualState((current) => ({
                            ...current,
                            [project.id]: {
                              ...visualState,
                              coverSourceType:
                                (value as "none" | "local" | "external") ?? project.coverSourceType,
                            },
                          }))
                        }
                        options={[
                          { label: "不使用封面", value: "none" },
                          { label: "本地媒体库", value: "local" },
                          { label: "外部图片链接", value: "external" },
                        ]}
                      />
                      {visualState.coverSourceType === "local" ? (
                        <ContentMediaSelectField
                          defaultValue={visualState.coverMediaAssetId}
                          label="本地封面"
                          mediaOptions={data.mediaOptions}
                          name={`project-coverMediaAssetId-${project.id}`}
                          onValueChange={(value) =>
                            setProjectVisualState((current) => ({
                              ...current,
                              [project.id]: {
                                ...visualState,
                                coverMediaAssetId: value,
                              },
                            }))
                          }
                        />
                      ) : null}
                      {visualState.coverSourceType === "external" ? (
                        <div className="md:col-span-2">
                          <ContentTextField
                            defaultValue={project.coverExternalUrl}
                            label="封面外链"
                            name={`project-coverExternalUrl-${project.id}`}
                            onValueChange={(value) =>
                              setProjectVisualState((current) => ({
                                ...current,
                                [project.id]: {
                                  ...visualState,
                                  coverExternalUrl: value,
                                },
                              }))
                            }
                            placeholder="https://example.com/cover.png"
                          />
                        </div>
                      ) : null}
                      <ContentImagePreview title="当前封面预览" url={previewUrl} />
                    </>
                  )}
                  <ContentTextField
                    defaultValue={project.previewUrl}
                    label="预览链接"
                    name={`project-previewUrl-${project.id}`}
                    placeholder="/admin"
                  />
                  <ContentTextField
                    defaultValue={project.repoUrl}
                    label="仓库链接"
                    name={`project-repoUrl-${project.id}`}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ContentToggleField
                    defaultChecked={project.isFeatured}
                    description="开启后项目会以推荐项目身份出现。"
                    label="推荐项目"
                    name={`project-featured-${project.id}`}
                  />
                  <ContentToggleField
                    defaultChecked={project.isEnabled}
                    description="关闭后项目不会出现在前台展示中。"
                    label="启用该项目"
                    name={`project-enabled-${project.id}`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <ConfirmActionButton
                    confirmLabel="确认删除项目"
                    confirmText="删除项目后不会自动恢复，确定继续吗？"
                    disabled={isDirty}
                    formAction={deleteProjectAction.bind(null, project.id)}
                    variant="danger"
                  >
                    删除项目
                  </ConfirmActionButton>
                </div>
                    </>
                  );
                })()}
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
