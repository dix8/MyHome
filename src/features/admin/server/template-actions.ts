"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import {
  flattenTemplateSchema,
  getDefaultTemplateConfig,
  type TemplatesFormState,
} from "@/features/admin/lib/template-draft";
import { getPrismaClient } from "@/server/db/client";
import { templateRegistry } from "@/templates/registry";
import type { TemplateConfig, TemplateField } from "@/templates/types";

import { requireTemplateAdmin } from "./templates";

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function normalizeString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function collectConfigValue(formData: FormData, field: TemplateField) {
  switch (field.type) {
    case "switch":
      return parseCheckbox(formData, field.key);
    case "number":
    case "slider": {
      const raw = Number(formData.get(field.key) ?? field.defaultValue);
      if (Number.isNaN(raw)) {
        throw new Error(`${field.label} 不是有效数字。`);
      }
      if (typeof field.min === "number" && raw < field.min) {
        throw new Error(`${field.label} 不能小于 ${field.min}。`);
      }
      if (typeof field.max === "number" && raw > field.max) {
        throw new Error(`${field.label} 不能大于 ${field.max}。`);
      }
      return raw;
    }
    case "select": {
      const value = normalizeString(formData.get(field.key)) || field.defaultValue;
      const isValid = field.options.some((option) => option.value === value);
      if (!isValid) {
        throw new Error(`${field.label} 不是有效选项。`);
      }
      return value;
    }
    case "text":
    case "textarea":
    case "color":
      return normalizeString(formData.get(field.key)) || field.defaultValue;
    case "group":
      return undefined;
  }
}

export async function saveTemplateDraftAction(
  _previousState: TemplatesFormState,
  formData: FormData,
): Promise<TemplatesFormState> {
  const templateId = normalizeString(formData.get("templateId"));

  if (!(templateId in templateRegistry)) {
    return {
      status: "error",
      message: "选择的模板未注册。",
    };
  }

  try {
    const prisma = getPrismaClient();
    const currentUser = await requireTemplateAdmin();
    const entry = templateRegistry[templateId as keyof typeof templateRegistry];
    const [manifest, schema] = await Promise.all([entry.manifest(), entry.schema()]);
    const defaultConfig = getDefaultTemplateConfig(manifest, schema);

    const templateConfig: TemplateConfig = {
      ...defaultConfig,
    };

    for (const field of flattenTemplateSchema(schema)) {
      templateConfig[field.key] = collectConfigValue(formData, field);
    }

    const existing = await prisma.siteThemeState.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (existing) {
      await prisma.siteThemeState.update({
        where: {
          id: existing.id,
        },
        data: {
          templateId,
          templateConfig: templateConfig as Prisma.InputJsonValue,
        },
      });
    } else {
      await prisma.siteThemeState.create({
        data: {
          templateId,
          templateConfig: templateConfig as Prisma.InputJsonValue,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "save_template",
        entityType: "site_theme_state",
        summary: `更新站点模板：${manifest.name}`,
        detail: {
          templateId,
          templateConfig,
        } as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/templates");

    return {
      status: "success",
      message: `已保存模板：${manifest.name}。首页会在下一次请求时显示最新模板效果。`,
    };
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "保存模板失败。",
      };
    }
}
