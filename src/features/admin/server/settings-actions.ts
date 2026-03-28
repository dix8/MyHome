"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getPrismaClient } from "@/server/db/client";
import { hashPassword, verifyPassword } from "@/server/auth/password";

import { getCurrentAdmin, type SettingsFormState } from "./settings";

const siteSettingsFormSchema = z.object({
  siteName: z.string().trim().min(1, "站点名称不能为空。").max(100, "站点名称过长。"),
  siteSubtitle: z.string().trim().max(255, "站点副标题过长。").optional(),
  seoTitle: z.string().trim().max(120, "SEO 标题过长。").optional(),
  seoDescription: z.string().trim().max(255, "SEO 描述过长。").optional(),
  seoKeywords: z.string().trim().optional(),
  footerText: z.string().trim().max(255, "页脚文案过长。").optional(),
  icpText: z.string().trim().max(100, "备案文案过长。").optional(),
  icpUrl: z
    .union([z.literal(""), z.string().trim().url("备案链接格式不正确。")])
    .optional(),
});

const accountSettingsFormSchema = z.object({
  accountDisplayName: z.string().trim().min(1, "显示名称不能为空。").max(80, "显示名称过长。"),
  accountEmail: z.string().trim().email("登录邮箱格式不正确。").max(191, "登录邮箱过长。"),
  currentPassword: z.string().optional(),
  newPassword: z
    .union([z.literal(""), z.string().min(8, "新密码至少需要 8 位。").max(128, "新密码过长。")])
    .optional(),
  confirmNewPassword: z.string().max(128, "确认密码过长。").optional(),
});

function optionalValue(value: string | null | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

function keywordsFromInput(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveSiteSettingsAction(
  _previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const rawInput = {
    siteName: formData.get("siteName"),
    siteSubtitle: formData.get("siteSubtitle"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    seoKeywords: formData.get("seoKeywords"),
    footerText: formData.get("footerText"),
    icpText: formData.get("icpText"),
    icpUrl: formData.get("icpUrl"),
  };

  const parsedInput = siteSettingsFormSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: parsedInput.error.issues[0]?.message ?? "表单校验失败。",
    };
  }

  try {
    const prisma = getPrismaClient();
    const currentUser = await getCurrentAdmin(prisma);

    const payload = parsedInput.data;

    await prisma.$transaction(async (tx) => {
      const existingSiteSettings = await tx.siteSettings.findFirst({
        orderBy: {
          createdAt: "asc",
        },
      });

      const siteSettingsData = {
        siteName: payload.siteName,
        siteSubtitle: optionalValue(payload.siteSubtitle) ?? null,
        seoTitle: optionalValue(payload.seoTitle) ?? null,
        seoDescription: optionalValue(payload.seoDescription) ?? null,
        seoKeywords: keywordsFromInput(payload.seoKeywords),
        footerText: optionalValue(payload.footerText) ?? null,
        icpText: optionalValue(payload.icpText) ?? null,
        icpUrl: optionalValue(payload.icpUrl) ?? null,
      };

      if (existingSiteSettings) {
        await tx.siteSettings.update({
          where: {
            id: existingSiteSettings.id,
          },
          data: siteSettingsData,
        });
      } else {
        await tx.siteSettings.create({
          data: siteSettingsData,
        });
      }

    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "save_settings",
        entityType: "site_settings",
        summary: `更新站点设置：${payload.siteName}`,
        detail: {
          siteName: payload.siteName,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/site");

    return {
      status: "success",
      message: "站点设置已保存，前台和后台会在下次请求时读取最新内容。",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "保存失败，请稍后重试。",
    };
  }
}

export async function saveAccountSettingsAction(
  _previousState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const rawInput = {
    accountDisplayName: formData.get("accountDisplayName"),
    accountEmail: formData.get("accountEmail"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  };

  const parsedInput = accountSettingsFormSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: parsedInput.error.issues[0]?.message ?? "表单校验失败。",
    };
  }

  try {
    const prisma = getPrismaClient();
    const currentUser = await getCurrentAdmin(prisma);
    const payload = parsedInput.data;
    const normalizedAccountEmail = payload.accountEmail.trim().toLowerCase();
    const wantsEmailChange = normalizedAccountEmail !== currentUser.email;
    const wantsPasswordChange = !!optionalValue(payload.newPassword);

    if (wantsPasswordChange && payload.newPassword !== payload.confirmNewPassword) {
      return {
        status: "error",
        message: "两次输入的新密码不一致。",
      };
    }

    if ((wantsEmailChange || wantsPasswordChange) && !optionalValue(payload.currentPassword)) {
      return {
        status: "error",
        message: "修改登录邮箱或密码时，需要先填写当前密码。",
      };
    }

    if ((wantsEmailChange || wantsPasswordChange) && !verifyPassword(payload.currentPassword ?? "", currentUser.passwordHash)) {
      return {
        status: "error",
        message: "当前密码不正确，无法修改登录账号信息。",
      };
    }

    if (wantsEmailChange) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: normalizedAccountEmail,
        },
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return {
          status: "error",
          message: "该登录邮箱已经被其他管理员使用。",
        };
      }
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        displayName: payload.accountDisplayName,
        email: normalizedAccountEmail,
        passwordHash: wantsPasswordChange ? hashPassword(payload.newPassword ?? "") : currentUser.passwordHash,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "save_account_settings",
        entityType: "user",
        entityId: currentUser.id,
        summary: `更新管理员账号：${payload.accountDisplayName}`,
        detail: {
          accountEmail: normalizedAccountEmail,
          accountDisplayName: payload.accountDisplayName,
          changedPassword: wantsPasswordChange,
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/site");
    revalidatePath("/admin/settings/account");

    return {
      status: "success",
      message: "管理员账号设置已保存，后台会在下一次请求时显示最新信息。",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "保存失败，请稍后重试。",
    };
  }
}
