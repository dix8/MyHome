import type { PrismaClient, User } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";
import { auth } from "@/server/auth";

export interface SettingsFormState {
  status: "idle" | "success" | "error";
  message: string | null;
}

export interface SettingsPageData {
  siteSettings: {
    siteName: string;
    siteSubtitle: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    footerText: string;
    icpText: string;
    icpUrl: string;
  };
  account: {
    email: string;
    displayName: string;
    lastLoginAt: string | null;
  };
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function getCurrentAdmin(prisma: PrismaClient): Promise<User> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("未登录，无法保存设置。");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new Error("当前管理员不存在。");
  }

  return user;
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const prisma = getPrismaClient();
  const [siteSettings, currentUser] = await Promise.all([
    prisma.siteSettings.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    }),
    getCurrentAdmin(prisma),
  ]);

  return {
    siteSettings: {
      siteName: siteSettings?.siteName ?? "",
      siteSubtitle: siteSettings?.siteSubtitle ?? "",
      seoTitle: siteSettings?.seoTitle ?? "",
      seoDescription: siteSettings?.seoDescription ?? "",
      seoKeywords: siteSettings?.seoKeywords.join(", ") ?? "",
      footerText: siteSettings?.footerText ?? "",
      icpText: siteSettings?.icpText ?? "",
      icpUrl: siteSettings?.icpUrl ?? "",
    },
    account: {
      email: currentUser.email,
      displayName: currentUser.displayName,
      lastLoginAt: formatDateTime(currentUser.lastLoginAt),
    },
  };
}
