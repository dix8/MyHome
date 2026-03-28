import { getCurrentSite } from "@/features/site/server/site-data";
import { getPrismaClient } from "@/server/db/client";
import { resolveTemplateManifest } from "@/templates/registry";

import { getCurrentAdmin } from "./settings";

export interface DashboardPageData {
  currentSite: Awaited<ReturnType<typeof getCurrentSite>>;
  stats: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  currentTemplate: {
    id: string;
    name: string;
    description: string;
  };
  recentActivity: Array<{
    id: string;
    summary: string;
    action: string;
    createdAt: string;
    userName: string | null;
  }>;
  account: {
    email: string;
    displayName: string;
  };
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function getDashboardPageData(): Promise<DashboardPageData> {
  const prisma = getPrismaClient();
  const [currentUser, currentSite, mediaCount, recentActivity] = await Promise.all([
    getCurrentAdmin(prisma),
    getCurrentSite(),
    prisma.mediaAsset.count({
      where: {
        deletedAt: null,
      },
    }),
    prisma.activityLog.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    }),
  ]);

  const currentTemplateManifest = await resolveTemplateManifest(currentSite.themeState.templateId);

  return {
    currentSite,
    stats: [
      {
        label: "技能组",
        value: String(currentSite.data.skills.length),
        hint: `技能项 ${currentSite.data.skills.reduce((count, group) => count + group.items.length, 0)} 个`,
      },
      {
        label: "项目",
        value: String(currentSite.data.projects.length),
        hint: `推荐项目 ${currentSite.data.projects.filter((item) => item.isFeatured).length} 个`,
      },
      {
        label: "联系方式",
        value: String(currentSite.data.contacts.length),
        hint: `启用中 ${currentSite.data.contacts.filter((item) => item.isEnabled).length} 个`,
      },
      {
        label: "媒体资源",
        value: String(mediaCount),
        hint: "本地媒体库有效资源",
      },
      {
        label: "启用模块",
        value: String(currentSite.data.sections.filter((item) => item.isEnabled).length),
        hint: `总模块 ${currentSite.data.sections.length} 个`,
      },
      {
        label: "当前模板",
        value: currentTemplateManifest?.name ?? currentSite.themeState.templateId,
        hint: currentSite.themeState.templateId,
      },
    ],
    currentTemplate: {
      id: currentSite.themeState.templateId,
      name: currentTemplateManifest?.name ?? currentSite.themeState.templateId,
      description: currentTemplateManifest?.description ?? "未找到模板说明。",
    },
    recentActivity: recentActivity.map((item) => ({
      id: item.id,
      summary: item.summary,
      action: item.action,
      createdAt: formatDateTime(item.createdAt),
      userName: item.user?.displayName ?? null,
    })),
    account: {
      email: currentUser.email,
      displayName: currentUser.displayName,
    },
  };
}
