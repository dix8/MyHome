"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getPrismaClient } from "@/server/db/client";
import { Prisma } from "@/generated/prisma/client";

import { requireContentAdmin, type ContentFormState } from "./content";

const heroSchema = z.object({
  greeting: z.string().trim().max(50, "称呼过长。").optional(),
  name: z.string().trim().min(1, "Hero 姓名不能为空。").max(80, "Hero 姓名过长。"),
  description: z.string().trim().optional(),
  titles: z.string().trim().min(1, "请至少填写一行 Hero 标题。"),
  avatarSourceType: z.enum(["none", "local", "external"]),
  avatarMediaAssetId: z.string().trim().optional(),
  avatarExternalUrl: z
    .union([z.literal(""), z.string().trim().url("Hero 头像外链格式不正确。")])
    .optional(),
  primaryButtonLabel: z.string().trim().max(50, "主按钮文案过长。").optional(),
  primaryButtonHref: z.union([z.literal(""), z.string().trim().max(255, "主按钮链接过长。")]).optional(),
  secondaryButtonLabel: z.string().trim().max(50, "次按钮文案过长。").optional(),
  secondaryButtonHref: z
    .union([z.literal(""), z.string().trim().max(255, "次按钮链接过长。")])
    .optional(),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, "项目名称不能为空。").max(120, "项目名称过长。"),
  description: z.string().trim().min(1, "项目简介不能为空。"),
  visualType: z.enum(["icon", "cover"]),
  iconName: z.string().trim().max(80, "图标名称过长。").optional(),
  coverSourceType: z.enum(["none", "local", "external"]),
  coverMediaAssetId: z.string().trim().optional(),
  coverExternalUrl: z
    .union([z.literal(""), z.string().trim().url("项目封面链接格式不正确。")])
    .optional(),
  repoUrl: z.union([z.literal(""), z.string().trim().max(255, "仓库链接过长。")]).optional(),
  previewUrl: z.union([z.literal(""), z.string().trim().max(255, "预览链接过长。")]).optional(),
  techStack: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0, "排序不能小于 0。"),
});

const skillGroupSchema = z.object({
  title: z.string().trim().min(1, "技能分组名称不能为空。").max(80, "技能分组名称过长。"),
  subtitle: z.string().trim().max(120, "技能分组副标题过长。").optional(),
  sortOrder: z.coerce.number().int().min(0, "技能分组排序不能小于 0。"),
});

const skillItemSchema = z.object({
  name: z.string().trim().min(1, "技能项名称不能为空。").max(80, "技能项名称过长。"),
  level: z
    .union([z.literal(""), z.coerce.number().int().min(0, "熟练度不能小于 0。").max(100, "熟练度不能大于 100。")])
    .optional(),
  sortOrder: z.coerce.number().int().min(0, "技能项排序不能小于 0。"),
});

const contactSchema = z.object({
  type: z.string().trim().min(1, "联系方式类型不能为空。").max(50, "联系方式类型过长。"),
  label: z.string().trim().min(1, "联系方式标签不能为空。").max(50, "联系方式标签过长。"),
  value: z.string().trim().min(1, "联系方式展示值不能为空。").max(255, "联系方式展示值过长。"),
  href: z.union([z.literal(""), z.string().trim().max(255, "联系方式链接过长。")]).optional(),
  iconType: z.enum(["builtin", "image"]),
  iconName: z.string().trim().max(80, "图标名称过长。").optional(),
  iconSourceType: z.enum(["none", "local", "external"]),
  iconMediaAssetId: z.string().trim().optional(),
  iconExternalUrl: z
    .union([z.literal(""), z.string().trim().url("图标外链格式不正确。")])
    .optional(),
  sortOrder: z.coerce.number().int().min(0, "联系方式排序不能小于 0。"),
});

function optionalValue(value: string | null | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

function lineSeparatedTitles(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaSeparatedItems(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

type ContentSubpage = "structure" | "hero" | "projects" | "skills" | "contacts";

function contentSubpagePath(subpage: ContentSubpage) {
  return `/admin/content/${subpage}`;
}

function contentRedirect(subpage: ContentSubpage, status: string, focusTarget?: string) {
  const query = new URLSearchParams({
    status,
  });

  if (focusTarget) {
    query.set("focus", focusTarget);
  }

  return `${contentSubpagePath(subpage)}?${query.toString()}`;
}

async function resolveContentActor(overrideUserId?: string) {
  const prisma = getPrismaClient();

  if (!overrideUserId) {
    return requireContentAdmin(prisma);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: overrideUserId,
    },
  });

  if (!user) {
    throw new Error("指定的内容管理员不存在。");
  }

  return user;
}

async function logContentAction(
  client: {
    activityLog: {
      create: (args: {
        data: {
          userId: string;
          action: string;
          entityType: string;
          entityId: string;
          summary: string;
          detail: Prisma.InputJsonValue;
        };
      }) => Promise<unknown>;
    };
  },
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
  detail: Prisma.InputJsonValue,
) {
  await client.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      summary,
      detail,
    },
  });
}

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/admin/content/structure");
  revalidatePath("/admin/content/hero");
  revalidatePath("/admin/content/projects");
  revalidatePath("/admin/content/skills");
  revalidatePath("/admin/content/contacts");
}

export async function saveContentAction(
  _previousState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const rawHeroInput = {
    greeting: readFormValue(formData, "heroGreeting"),
    name: readFormValue(formData, "heroName"),
    description: readFormValue(formData, "heroDescription"),
    titles: readFormValue(formData, "heroTitles"),
    avatarSourceType: readFormValue(formData, "heroAvatarSourceType"),
    avatarMediaAssetId: readFormValue(formData, "heroAvatarMediaAssetId"),
    avatarExternalUrl: readFormValue(formData, "heroAvatarExternalUrl"),
    primaryButtonLabel: readFormValue(formData, "primaryButtonLabel"),
    primaryButtonHref: readFormValue(formData, "primaryButtonHref"),
    secondaryButtonLabel: readFormValue(formData, "secondaryButtonLabel"),
    secondaryButtonHref: readFormValue(formData, "secondaryButtonHref"),
  };

  const parsedHero = heroSchema.safeParse(rawHeroInput);

  if (!parsedHero.success) {
    return {
      status: "error",
      message: parsedHero.error.issues[0]?.message ?? "Hero 表单校验失败。",
    };
  }

  const sectionIds = formData
    .getAll("sectionIds")
    .map((value) => String(value))
    .filter(Boolean);
  const footerSectionId = String(formData.get("footerSectionId") ?? "").trim();
  const navigationIds = formData
    .getAll("navigationIds")
    .map((value) => String(value))
    .filter(Boolean);
  const projectIds = formData
    .getAll("projectIds")
    .map((value) => String(value))
    .filter(Boolean);
  const skillGroupIds = formData
    .getAll("skillGroupIds")
    .map((value) => String(value))
    .filter(Boolean);
  const skillItemIds = formData
    .getAll("skillItemIds")
    .map((value) => String(value))
    .filter(Boolean);
  const contactIds = formData
    .getAll("contactIds")
    .map((value) => String(value))
    .filter(Boolean);

  const parsedProjects = projectIds.map((projectId) => ({
    id: projectId,
    result: projectSchema.safeParse({
      title: readFormValue(formData, `project-title-${projectId}`),
      description: readFormValue(formData, `project-description-${projectId}`),
      visualType: readFormValue(formData, `project-visualType-${projectId}`),
      iconName: readFormValue(formData, `project-iconName-${projectId}`),
      coverSourceType: readFormValue(formData, `project-coverSourceType-${projectId}`),
      coverMediaAssetId: readFormValue(formData, `project-coverMediaAssetId-${projectId}`),
      coverExternalUrl: readFormValue(formData, `project-coverExternalUrl-${projectId}`),
      repoUrl: readFormValue(formData, `project-repoUrl-${projectId}`),
      previewUrl: readFormValue(formData, `project-previewUrl-${projectId}`),
      techStack: readFormValue(formData, `project-techStack-${projectId}`),
      sortOrder: readFormValue(formData, `project-sortOrder-${projectId}`),
    }),
  }));

  const firstProjectError = parsedProjects.find((entry) => !entry.result.success);

  if (firstProjectError && !firstProjectError.result.success) {
    return {
      status: "error",
      message: firstProjectError.result.error.issues[0]?.message ?? "项目表单校验失败。",
    };
  }

  const parsedSkillGroups = skillGroupIds.map((groupId) => ({
    id: groupId,
    result: skillGroupSchema.safeParse({
      title: readFormValue(formData, `skill-group-title-${groupId}`),
      subtitle: readFormValue(formData, `skill-group-subtitle-${groupId}`),
      sortOrder: readFormValue(formData, `skill-group-sortOrder-${groupId}`),
    }),
  }));

  const firstSkillGroupError = parsedSkillGroups.find((entry) => !entry.result.success);

  if (firstSkillGroupError && !firstSkillGroupError.result.success) {
    return {
      status: "error",
      message: firstSkillGroupError.result.error.issues[0]?.message ?? "技能分组表单校验失败。",
    };
  }

  const parsedSkillItems = skillItemIds.map((itemId) => ({
    id: itemId,
    result: skillItemSchema.safeParse({
      name: readFormValue(formData, `skill-item-name-${itemId}`),
      level: readFormValue(formData, `skill-item-level-${itemId}`),
      sortOrder: readFormValue(formData, `skill-item-sortOrder-${itemId}`),
    }),
  }));

  const firstSkillItemError = parsedSkillItems.find((entry) => !entry.result.success);

  if (firstSkillItemError && !firstSkillItemError.result.success) {
    return {
      status: "error",
      message: firstSkillItemError.result.error.issues[0]?.message ?? "技能项表单校验失败。",
    };
  }

  const parsedContacts = contactIds.map((contactId) => ({
    id: contactId,
    result: contactSchema.safeParse({
      type: readFormValue(formData, `contact-type-${contactId}`),
      label: readFormValue(formData, `contact-label-${contactId}`),
      value: readFormValue(formData, `contact-value-${contactId}`),
      href: readFormValue(formData, `contact-href-${contactId}`),
      iconType: readFormValue(formData, `contact-iconType-${contactId}`),
      iconName: readFormValue(formData, `contact-iconName-${contactId}`),
      iconSourceType: readFormValue(formData, `contact-iconSourceType-${contactId}`),
      iconMediaAssetId: readFormValue(formData, `contact-iconMediaAssetId-${contactId}`),
      iconExternalUrl: readFormValue(formData, `contact-iconExternalUrl-${contactId}`),
      sortOrder: readFormValue(formData, `contact-sortOrder-${contactId}`),
    }),
  }));

  const firstContactError = parsedContacts.find((entry) => !entry.result.success);

  if (firstContactError && !firstContactError.result.success) {
    return {
      status: "error",
      message: firstContactError.result.error.issues[0]?.message ?? "联系方式表单校验失败。",
    };
  }

  try {
    const prisma = getPrismaClient();
    const currentUser = await requireContentAdmin(prisma);

    await prisma.$transaction(async (tx) => {
      for (const sectionId of sectionIds) {
        await tx.homeSection.update({
          where: {
            id: sectionId,
          },
          data: {
            isEnabled: parseCheckbox(formData, `section-enabled-${sectionId}`),
          },
        });
      }

      if (footerSectionId) {
        const footerSection = await tx.homeSection.findUnique({
          where: {
            id: footerSectionId,
          },
        });

        if (footerSection) {
          const existingConfig =
            footerSection.sectionConfig && typeof footerSection.sectionConfig === "object"
              ? (footerSection.sectionConfig as Record<string, unknown>)
              : {};

          await tx.homeSection.update({
            where: {
              id: footerSectionId,
            },
            data: {
              sectionConfig: {
                ...existingConfig,
                showAdminShortcut: parseCheckbox(formData, "showAdminShortcut"),
              } as Prisma.InputJsonValue,
            },
          });
        }
      }

      for (const navigationId of navigationIds) {
        const label = String(formData.get(`nav-label-${navigationId}`) ?? "").trim();
        const href = String(formData.get(`nav-href-${navigationId}`) ?? "").trim();

        if (!label) {
          throw new Error("导航名称不能为空。");
        }

        if (!href) {
          throw new Error("导航链接不能为空。");
        }

        await tx.navigationItem.update({
          where: {
            id: navigationId,
          },
          data: {
            label,
            href,
            isEnabled: parseCheckbox(formData, `nav-enabled-${navigationId}`),
            openInNewTab: parseCheckbox(formData, `nav-newtab-${navigationId}`),
          },
        });
      }

      for (const entry of parsedProjects) {
        if (!entry.result.success) {
          continue;
        }

        const payload = entry.result.data;
        const hasLocalCoverAsset =
          payload.visualType === "cover" &&
          payload.coverSourceType === "local" &&
          !!optionalValue(payload.coverMediaAssetId);
        const hasExternalCover =
          payload.visualType === "cover" &&
          payload.coverSourceType === "external" &&
          !!optionalValue(payload.coverExternalUrl);

        await tx.project.update({
          where: {
            id: entry.id,
          },
          data: {
            title: payload.title,
            description: payload.description,
            visualType: payload.visualType,
            iconName: payload.visualType === "icon" ? optionalValue(payload.iconName) ?? null : null,
            coverSourceType: hasLocalCoverAsset ? "local" : hasExternalCover ? "external" : "none",
            coverMediaAssetId: hasLocalCoverAsset ? optionalValue(payload.coverMediaAssetId) ?? null : null,
            coverExternalUrl: hasExternalCover ? optionalValue(payload.coverExternalUrl) ?? null : null,
            repoUrl: optionalValue(payload.repoUrl) ?? null,
            previewUrl: optionalValue(payload.previewUrl) ?? null,
            techStack: commaSeparatedItems(payload.techStack),
            sortOrder: payload.sortOrder,
            isFeatured: parseCheckbox(formData, `project-featured-${entry.id}`),
            isEnabled: parseCheckbox(formData, `project-enabled-${entry.id}`),
          },
        });
      }

      for (const entry of parsedSkillGroups) {
        if (!entry.result.success) {
          continue;
        }

        const payload = entry.result.data;

        await tx.skillGroup.update({
          where: {
            id: entry.id,
          },
          data: {
            title: payload.title,
            subtitle: optionalValue(payload.subtitle) ?? null,
            sortOrder: payload.sortOrder,
            isEnabled: parseCheckbox(formData, `skill-group-enabled-${entry.id}`),
          },
        });
      }

      for (const entry of parsedSkillItems) {
        if (!entry.result.success) {
          continue;
        }

        const payload = entry.result.data;

        await tx.skillItem.update({
          where: {
            id: entry.id,
          },
          data: {
            name: payload.name,
            level: payload.level === "" || payload.level === undefined ? null : payload.level,
            sortOrder: payload.sortOrder,
            isEnabled: parseCheckbox(formData, `skill-item-enabled-${entry.id}`),
          },
        });
      }

      for (const entry of parsedContacts) {
        if (!entry.result.success) {
          continue;
        }

        const payload = entry.result.data;
        const hasLocalIcon =
          payload.iconType === "image" &&
          payload.iconSourceType === "local" &&
          !!optionalValue(payload.iconMediaAssetId);
        const hasExternalIcon =
          payload.iconType === "image" &&
          payload.iconSourceType === "external" &&
          !!optionalValue(payload.iconExternalUrl);

        await tx.contactItem.update({
          where: {
            id: entry.id,
          },
          data: {
            type: payload.type,
            label: payload.label,
            value: payload.value,
            href: optionalValue(payload.href) ?? null,
            iconType: payload.iconType,
            iconName: payload.iconType === "builtin" ? optionalValue(payload.iconName) ?? null : null,
            iconSourceType: hasLocalIcon ? "local" : hasExternalIcon ? "external" : "none",
            iconMediaAssetId: hasLocalIcon ? optionalValue(payload.iconMediaAssetId) ?? null : null,
            iconExternalUrl: hasExternalIcon ? optionalValue(payload.iconExternalUrl) ?? null : null,
            openInNewTab: parseCheckbox(formData, `contact-newtab-${entry.id}`),
            isEnabled: parseCheckbox(formData, `contact-enabled-${entry.id}`),
            sortOrder: payload.sortOrder,
          },
        });
      }

      const existingHeroProfile = await tx.heroProfile.findFirst({
        orderBy: {
          createdAt: "asc",
        },
      });

      const heroPayload = parsedHero.data;
      const hasLocalAvatar =
        heroPayload.avatarSourceType === "local" && !!optionalValue(heroPayload.avatarMediaAssetId);
      const hasExternalAvatar =
        heroPayload.avatarSourceType === "external" && !!optionalValue(heroPayload.avatarExternalUrl);
      const avatarSourceType: "none" | "local" | "external" = hasLocalAvatar
        ? "local"
        : hasExternalAvatar
          ? "external"
          : "none";
      const heroData = {
        greeting: optionalValue(heroPayload.greeting) ?? null,
        name: heroPayload.name,
        description: optionalValue(heroPayload.description) ?? null,
        typingTitles: lineSeparatedTitles(heroPayload.titles),
        avatarSourceType,
        avatarMediaAssetId: hasLocalAvatar ? optionalValue(heroPayload.avatarMediaAssetId) ?? null : null,
        avatarExternalUrl: hasExternalAvatar ? optionalValue(heroPayload.avatarExternalUrl) ?? null : null,
        primaryButtonLabel: optionalValue(heroPayload.primaryButtonLabel) ?? null,
        primaryButtonHref: optionalValue(heroPayload.primaryButtonHref) ?? null,
        secondaryButtonLabel: optionalValue(heroPayload.secondaryButtonLabel) ?? null,
        secondaryButtonHref: optionalValue(heroPayload.secondaryButtonHref) ?? null,
      };

      if (existingHeroProfile) {
        await tx.heroProfile.update({
          where: {
            id: existingHeroProfile.id,
          },
          data: heroData,
        });
      } else {
        await tx.heroProfile.create({
          data: heroData,
        });
      }
    });

    await logContentAction(
      prisma,
      currentUser.id,
      "save_content",
      "content",
      "current",
      `更新首页内容：${parsedHero.data.name}`,
      {
        sectionCount: sectionIds.length,
        navigationCount: navigationIds.length,
        projectCount: projectIds.length,
        skillGroupCount: skillGroupIds.length,
        skillItemCount: skillItemIds.length,
        contactCount: contactIds.length,
      },
    );

    revalidateContentPaths();

    return {
      status: "success",
      message: "内容页配置已保存，首页和后台会在下一次请求时显示最新内容。",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "保存失败，请稍后重试。",
    };
  }
}

export async function addProjectAction(_formData?: FormData, overrideUserId?: string) {
  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);

  const nextSortOrder = await prisma.project.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  const project = await prisma.project.create({
    data: {
      title: "新项目",
      description: "待补充项目简介。",
      visualType: "icon",
      iconName: "sparkles",
      techStack: [],
      isFeatured: false,
      sortOrder: (nextSortOrder._max.sortOrder ?? 0) + 1,
      isEnabled: true,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "create_project",
    "project",
    project.id,
    `新增项目：${project.title}`,
    {
      projectId: project.id,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("projects", "project-created", `project:${project.id}`));
  }
}

export async function deleteProjectAction(projectId: string, _formData?: FormData, overrideUserId?: string) {

  if (!projectId) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) {
    return;
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "delete_project",
    "project",
    projectId,
    `删除项目：${existing.title}`,
    {
      projectId,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("projects", "project-deleted"));
  }
}

export async function addSkillGroupAction(_formData?: FormData, overrideUserId?: string) {
  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const nextSortOrder = await prisma.skillGroup.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  const group = await prisma.skillGroup.create({
    data: {
      title: "新技能分组",
      subtitle: "待补充分组说明。",
      sortOrder: (nextSortOrder._max.sortOrder ?? 0) + 1,
      isEnabled: true,
      skillItems: {
        create: {
          name: "新技能项",
          level: null,
          sortOrder: 0,
          isEnabled: true,
        },
      },
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "create_skill_group",
    "skill_group",
    group.id,
    `新增技能分组：${group.title}`,
    {
      skillGroupId: group.id,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("skills", "skill-group-created", `skill-group:${group.id}`));
  }
}

export async function deleteSkillGroupAction(
  skillGroupId: string,
  _formData?: FormData,
  overrideUserId?: string,
) {

  if (!skillGroupId) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const existing = await prisma.skillGroup.findUnique({
    where: { id: skillGroupId },
  });

  if (!existing) {
    return;
  }

  await prisma.skillGroup.delete({
    where: {
      id: skillGroupId,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "delete_skill_group",
    "skill_group",
    skillGroupId,
    `删除技能分组：${existing.title}`,
    {
      skillGroupId,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("skills", "skill-group-deleted"));
  }
}

export async function addSkillItemAction(
  skillGroupId: string,
  _formData?: FormData,
  overrideUserId?: string,
) {

  if (!skillGroupId) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const nextSortOrder = await prisma.skillItem.aggregate({
    where: {
      skillGroupId,
    },
    _max: {
      sortOrder: true,
    },
  });

  const item = await prisma.skillItem.create({
    data: {
      skillGroupId,
      name: "新技能项",
      level: null,
      sortOrder: (nextSortOrder._max.sortOrder ?? 0) + 1,
      isEnabled: true,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "create_skill_item",
    "skill_item",
    item.id,
    `新增技能项：${item.name}`,
    {
      skillItemId: item.id,
      skillGroupId,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("skills", "skill-item-created", `skill-item:${item.id}`));
  }
}

export async function deleteSkillItemAction(
  skillItemId: string,
  _formData?: FormData,
  overrideUserId?: string,
) {

  if (!skillItemId) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const existing = await prisma.skillItem.findUnique({
    where: { id: skillItemId },
  });

  if (!existing) {
    return;
  }

  await prisma.skillItem.delete({
    where: {
      id: skillItemId,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "delete_skill_item",
    "skill_item",
    skillItemId,
    `删除技能项：${existing.name}`,
    {
      skillItemId,
      skillGroupId: existing.skillGroupId,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("skills", "skill-item-deleted"));
  }
}

export async function addContactAction(_formData?: FormData, overrideUserId?: string) {
  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const nextSortOrder = await prisma.contactItem.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  const contact = await prisma.contactItem.create({
    data: {
      type: "custom",
      label: "新联系方式",
      value: "待补充联系方式",
      href: null,
      iconType: "builtin",
      iconName: "link",
      iconSourceType: "none",
      openInNewTab: false,
      sortOrder: (nextSortOrder._max.sortOrder ?? 0) + 1,
      isEnabled: true,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "create_contact",
    "contact_item",
    contact.id,
    `新增联系方式：${contact.label}`,
    {
      contactId: contact.id,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("contacts", "contact-created", `contact:${contact.id}`));
  }
}

export async function deleteContactAction(contactId: string, _formData?: FormData, overrideUserId?: string) {

  if (!contactId) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);
  const existing = await prisma.contactItem.findUnique({
    where: { id: contactId },
  });

  if (!existing) {
    return;
  }

  await prisma.contactItem.delete({
    where: {
      id: contactId,
    },
  });

  await logContentAction(
    prisma,
    currentUser.id,
    "delete_contact",
    "contact_item",
    contactId,
    `删除联系方式：${existing.label}`,
    {
      contactId,
    } as Prisma.InputJsonValue,
  );

  revalidateContentPaths();

  if (!overrideUserId) {
    redirect(contentRedirect("contacts", "contact-deleted"));
  }
}

export async function moveContentItemAction(
  moveTarget: string,
  _formData?: FormData,
  overrideUserId?: string,
) {
  const [entityType, entityId, direction] = moveTarget.split(":");

  if (!entityType || !entityId || !direction) {
    return;
  }

  const prisma = getPrismaClient();
  const currentUser = await resolveContentActor(overrideUserId);

  const directionStep = direction === "up" ? -1 : direction === "down" ? 1 : 0;

  if (directionStep === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    switch (entityType) {
      case "section": {
        const items = await tx.homeSection.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.homeSection.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.homeSection.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_section",
          "home_section",
          target.id,
          `调整模块顺序：${target.sectionKey}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
          },
        );
        return;
      }
      case "navigation": {
        const items = await tx.navigationItem.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.navigationItem.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.navigationItem.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_navigation",
          "navigation_item",
          target.id,
          `调整导航顺序：${target.label}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
          },
        );
        return;
      }
      case "project": {
        const items = await tx.project.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.project.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.project.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_project",
          "project",
          target.id,
          `调整项目顺序：${target.title}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
          },
        );
        return;
      }
      case "skill-group": {
        const items = await tx.skillGroup.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.skillGroup.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.skillGroup.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_skill_group",
          "skill_group",
          target.id,
          `调整技能分组顺序：${target.title}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
          },
        );
        return;
      }
      case "skill-item": {
        const currentItem = await tx.skillItem.findUnique({
          where: { id: entityId },
        });
        if (!currentItem) return;

        const items = await tx.skillItem.findMany({
          where: {
            skillGroupId: currentItem.skillGroupId,
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.skillItem.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.skillItem.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_skill_item",
          "skill_item",
          target.id,
          `调整技能项顺序：${target.name}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
            skillGroupId: target.skillGroupId,
          },
        );
        return;
      }
      case "contact": {
        const items = await tx.contactItem.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
        const index = items.findIndex((item) => item.id === entityId);
        const target = items[index];
        const swap = items[index + directionStep];
        if (!target || !swap) return;

        await tx.contactItem.update({
          where: { id: target.id },
          data: { sortOrder: swap.sortOrder },
        });
        await tx.contactItem.update({
          where: { id: swap.id },
          data: { sortOrder: target.sortOrder },
        });
        await logContentAction(
          tx,
          currentUser.id,
          "move_contact",
          "contact_item",
          target.id,
          `调整联系方式顺序：${target.label}`,
          {
            direction,
            targetId: target.id,
            swapId: swap.id,
          },
        );
        return;
      }
      default:
        return;
    }
  });

  revalidateContentPaths();

  const redirectSubpage =
    entityType === "section"
      ? "structure"
      : entityType === "navigation"
        ? "hero"
        : entityType === "project"
          ? "projects"
          : entityType === "skill-group" || entityType === "skill-item"
            ? "skills"
            : "contacts";

  if (!overrideUserId) {
    redirect(contentRedirect(redirectSubpage, "order-updated", `${entityType}:${entityId}`));
  }
}
