import { getCurrentSite } from "@/features/site/server/site-data";
import { getPrismaClient } from "@/server/db/client";
import { templateRegistry } from "@/templates/registry";
import type { TemplateDefinition } from "@/features/admin/lib/template-draft";

import { getCurrentAdmin } from "./settings";

const templateDisplayOrder = [
  "glow-vision",
  "neon-tech",
  "minimal-card",
  "signal-grid",
] as const;

export interface TemplatesPageData {
  templates: TemplateDefinition[];
  currentThemeState: Awaited<ReturnType<typeof getCurrentSite>>["themeState"];
  currentSite: Awaited<ReturnType<typeof getCurrentSite>>["data"];
  account: {
    email: string;
    displayName: string;
  };
}

export async function getTemplatesPageData(): Promise<TemplatesPageData> {
  const prisma = getPrismaClient();
  const [currentUser, currentSite, templates] = await Promise.all([
    getCurrentAdmin(prisma),
    getCurrentSite(),
    Promise.all(
      Object.values(templateRegistry).map(async (entry) => ({
        manifest: await entry.manifest(),
        schema: await entry.schema(),
      })),
    ),
  ]);

  templates.sort((left, right) => {
    const leftIndex = templateDisplayOrder.indexOf(left.manifest.id as (typeof templateDisplayOrder)[number]);
    const rightIndex = templateDisplayOrder.indexOf(right.manifest.id as (typeof templateDisplayOrder)[number]);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.manifest.name.localeCompare(right.manifest.name, "zh-CN");
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });

  return {
    templates,
    currentThemeState: currentSite.themeState,
    currentSite: currentSite.data,
    account: {
      email: currentUser.email,
      displayName: currentUser.displayName,
    },
  };
}

export async function requireTemplateAdmin() {
  const prisma = getPrismaClient();
  return getCurrentAdmin(prisma);
}
