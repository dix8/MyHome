"use client";

import { useActionState, useState } from "react";

import { ConfirmActionButton } from "@/features/admin/components/confirm-action-button";
import type { ContentFormState, ContentPageData } from "@/features/admin/server/content";
import { addContactAction, deleteContactAction, saveContentAction } from "@/features/admin/server/content-actions";
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

export function ContentContactsEditor({
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
  const [contactIconState, setContactIconState] = useState(
    Object.fromEntries(
      data.contacts.map((contact) => [
        contact.id,
        {
          externalUrl: contact.iconExternalUrl,
          iconType: contact.iconType,
          mediaAssetId: contact.iconMediaAssetId,
          sourceType: contact.iconSourceType,
        },
      ]),
    ) as Record<
      string,
      {
        externalUrl: string;
        iconType: "builtin" | "image";
        mediaAssetId: string;
        sourceType: "none" | "local" | "external";
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
                <Badge tone="neutral">{data.contacts.length} 项</Badge>
                <Button disabled={isDirty} formAction={addContactAction} type="submit" variant="secondary">
                  新增联系方式
                </Button>
              </div>
            }
            description="联系区字段、图标来源和跳转链接在这里统一维护。"
            title="联系方式"
          />
          <div className="mt-5 grid gap-4">
            {data.contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/4 px-4 py-3.5"
                data-focus-target={`contact:${contact.id}`}
              >
                {(() => {
                  const iconState = contactIconState[contact.id] ?? {
                    externalUrl: contact.iconExternalUrl,
                    iconType: contact.iconType,
                    mediaAssetId: contact.iconMediaAssetId,
                    sourceType: contact.iconSourceType,
                  };
                  const previewUrl =
                    iconState.iconType === "image"
                      ? iconState.sourceType === "local"
                        ? resolveMediaUrl(data.mediaOptions, iconState.mediaAssetId)
                        : iconState.sourceType === "external"
                          ? iconState.externalUrl
                          : ""
                      : "";

                  return (
                    <>
                <input name="contactIds" type="hidden" value={contact.id} />
                <input name={`contact-sortOrder-${contact.id}`} type="hidden" value={String(contact.sortOrder)} />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <ContentItemHeader
                    enabled={contact.isEnabled}
                    indexLabel={`第 ${index + 1} 项`}
                    title={contact.label || "未命名联系方式"}
                  />
                  <ContentMoveButtons
                    disableDown={index === data.contacts.length - 1}
                    disableUp={index === 0}
                    disabled={isDirty}
                    target={`contact:${contact.id}`}
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 md:[&>*]:min-w-0">
                  <ContentTextField
                    defaultValue={contact.type}
                    label="联系方式类型"
                    name={`contact-type-${contact.id}`}
                    placeholder="例如：email / github / custom"
                  />
                  <ContentTextField
                    defaultValue={contact.label}
                    label="标签"
                    name={`contact-label-${contact.id}`}
                    placeholder="例如：邮箱"
                  />
                  <ContentTextField
                    defaultValue={contact.value}
                    label="展示值"
                    name={`contact-value-${contact.id}`}
                    placeholder="例如：hello@example.com"
                  />
                  <ContentTextField
                    defaultValue={contact.href}
                    label="跳转链接"
                    name={`contact-href-${contact.id}`}
                    placeholder="mailto:hello@example.com 或 https://..."
                  />
                  <ContentSelectField
                    defaultValue={iconState.iconType}
                    label="图标类型"
                    name={`contact-iconType-${contact.id}`}
                    onValueChange={(value) =>
                      setContactIconState((current) => ({
                        ...current,
                        [contact.id]: {
                          ...iconState,
                          iconType: (value as "builtin" | "image") ?? contact.iconType,
                        },
                      }))
                    }
                    options={[
                      { label: "内置图标", value: "builtin" },
                      { label: "图片图标", value: "image" },
                    ]}
                  />
                  {iconState.iconType === "builtin" ? (
                    <ContentTextField
                      defaultValue={contact.iconName}
                      label="图标名称"
                      name={`contact-iconName-${contact.id}`}
                      placeholder="例如：mail / github"
                    />
                  ) : (
                    <>
                      <ContentSelectField
                        defaultValue={iconState.sourceType}
                        label="图标来源"
                        name={`contact-iconSourceType-${contact.id}`}
                        onValueChange={(value) =>
                          setContactIconState((current) => ({
                            ...current,
                            [contact.id]: {
                              ...iconState,
                              sourceType: (value as "none" | "local" | "external") ?? contact.iconSourceType,
                            },
                          }))
                        }
                        options={[
                          { label: "不使用图片图标", value: "none" },
                          { label: "本地媒体库", value: "local" },
                          { label: "外部图片链接", value: "external" },
                        ]}
                      />
                      {iconState.sourceType === "local" ? (
                        <ContentMediaSelectField
                          defaultValue={iconState.mediaAssetId}
                          label="本地图标"
                          mediaOptions={data.mediaOptions}
                          name={`contact-iconMediaAssetId-${contact.id}`}
                          onValueChange={(value) =>
                            setContactIconState((current) => ({
                              ...current,
                              [contact.id]: {
                                ...iconState,
                                mediaAssetId: value,
                              },
                            }))
                          }
                        />
                      ) : null}
                      {iconState.sourceType === "external" ? (
                        <div className="md:col-span-2">
                          <ContentTextField
                            defaultValue={contact.iconExternalUrl}
                            label="图标外链"
                            name={`contact-iconExternalUrl-${contact.id}`}
                            onValueChange={(value) =>
                              setContactIconState((current) => ({
                                ...current,
                                [contact.id]: {
                                  ...iconState,
                                  externalUrl: value,
                                },
                              }))
                            }
                            placeholder="https://example.com/icon.png"
                          />
                        </div>
                      ) : null}
                      <ContentImagePreview title="当前图标预览" url={previewUrl} />
                    </>
                  )}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ContentToggleField
                    defaultChecked={contact.openInNewTab}
                    description="开启后该联系方式链接会在新窗口打开。"
                    label="新窗口打开"
                    name={`contact-newtab-${contact.id}`}
                  />
                  <ContentToggleField
                    defaultChecked={contact.isEnabled}
                    description="关闭后该联系方式不会在前台显示。"
                    label="启用该联系方式"
                    name={`contact-enabled-${contact.id}`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <ConfirmActionButton
                    confirmLabel="确认删除联系方式"
                    confirmText="删除后该联系方式将不再出现在首页联系区，确定继续吗？"
                    disabled={isDirty}
                    formAction={deleteContactAction.bind(null, contact.id)}
                    variant="danger"
                  >
                    删除联系方式
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
