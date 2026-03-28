import { randomUUID } from "node:crypto";
import path from "node:path";

import { getPrismaClient } from "@/server/db/client";

import { getCurrentAdmin } from "./settings";

export interface MediaUsageSummary {
  total: number;
  labels: string[];
}

export interface MediaAssetListItem {
  id: string;
  originalName: string;
  publicUrl: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
  usage: MediaUsageSummary;
}

export interface MediaPageData {
  assets: MediaAssetListItem[];
  stats: {
    totalAssets: number;
    referencedAssets: number;
    unreferencedAssets: number;
  };
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

function buildUsageMap(items: Array<{ mediaAssetId: string | null; label: string }>) {
  const map = new Map<string, string[]>();

  for (const item of items) {
    if (!item.mediaAssetId) {
      continue;
    }

    const current = map.get(item.mediaAssetId) ?? [];
    current.push(item.label);
    map.set(item.mediaAssetId, current);
  }

  return map;
}

export async function getMediaUsageSummary(mediaAssetId: string) {
  const prisma = getPrismaClient();
  const [siteSettings, heroProfiles, projects, contacts] = await Promise.all([
    prisma.siteSettings.findMany({
      where: {
        faviconMediaAssetId: mediaAssetId,
      },
      select: {
        faviconMediaAssetId: true,
      },
    }),
    prisma.heroProfile.findMany({
      where: {
        avatarMediaAssetId: mediaAssetId,
      },
      select: {
        avatarMediaAssetId: true,
      },
    }),
    prisma.project.findMany({
      where: {
        coverMediaAssetId: mediaAssetId,
      },
      select: {
        id: true,
        title: true,
      },
    }),
    prisma.contactItem.findMany({
      where: {
        iconMediaAssetId: mediaAssetId,
      },
      select: {
        id: true,
        label: true,
      },
    }),
  ]);

  const labels: string[] = [];

  if (siteSettings.length > 0) {
    labels.push("站点 favicon");
  }

  if (heroProfiles.length > 0) {
    labels.push("Hero 头像");
  }

  labels.push(...projects.map((project) => `项目封面：${project.title}`));
  labels.push(...contacts.map((contact) => `联系方式图标：${contact.label}`));

  return {
    total: labels.length,
    labels,
  };
}

export async function getMediaPageData(): Promise<MediaPageData> {
  const prisma = getPrismaClient();
  const [currentUser, assets, siteSettings, heroProfiles, projects, contacts] = await Promise.all([
    getCurrentAdmin(prisma),
    prisma.mediaAsset.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.siteSettings.findMany({
      where: {
        faviconMediaAssetId: {
          not: null,
        },
      },
      select: {
        faviconMediaAssetId: true,
      },
    }),
    prisma.heroProfile.findMany({
      where: {
        avatarMediaAssetId: {
          not: null,
        },
      },
      select: {
        avatarMediaAssetId: true,
      },
    }),
    prisma.project.findMany({
      where: {
        coverMediaAssetId: {
          not: null,
        },
      },
      select: {
        coverMediaAssetId: true,
        title: true,
      },
    }),
    prisma.contactItem.findMany({
      where: {
        iconMediaAssetId: {
          not: null,
        },
      },
      select: {
        iconMediaAssetId: true,
        label: true,
      },
    }),
  ]);

  const usageMap = new Map<string, string[]>();

  const mergeUsage = (map: Map<string, string[]>) => {
    for (const [key, labels] of map.entries()) {
      const current = usageMap.get(key) ?? [];
      usageMap.set(key, [...current, ...labels]);
    }
  };

  mergeUsage(
    buildUsageMap(siteSettings.map((item) => ({ mediaAssetId: item.faviconMediaAssetId, label: "站点 favicon" }))),
  );
  mergeUsage(
    buildUsageMap(heroProfiles.map((item) => ({ mediaAssetId: item.avatarMediaAssetId, label: "Hero 头像" }))),
  );
  mergeUsage(
    buildUsageMap(projects.map((item) => ({ mediaAssetId: item.coverMediaAssetId, label: `项目封面：${item.title}` }))),
  );
  mergeUsage(
    buildUsageMap(contacts.map((item) => ({ mediaAssetId: item.iconMediaAssetId, label: `联系方式图标：${item.label}` }))),
  );

  const mediaItems = assets.map((asset) => {
    const labels = usageMap.get(asset.id) ?? [];

    return {
      id: asset.id,
      originalName: asset.originalName,
      publicUrl: asset.publicUrl,
      mimeType: asset.mimeType,
      extension: asset.extension,
      sizeBytes: asset.sizeBytes.toString(),
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      createdAt: formatDateTime(asset.createdAt),
      usage: {
        total: labels.length,
        labels,
      },
    } satisfies MediaAssetListItem;
  });

  const referencedAssets = mediaItems.filter((asset) => asset.usage.total > 0).length;

  return {
    assets: mediaItems,
    stats: {
      totalAssets: mediaItems.length,
      referencedAssets,
      unreferencedAssets: mediaItems.length - referencedAssets,
    },
    account: {
      email: currentUser.email,
      displayName: currentUser.displayName,
    },
  };
}

export interface MediaOption {
  id: string;
  label: string;
  publicUrl: string;
}

export async function getMediaOptions(): Promise<MediaOption[]> {
  const prisma = getPrismaClient();
  const assets = await prisma.mediaAsset.findMany({
    where: {
      deletedAt: null,
      kind: "image",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      originalName: true,
      publicUrl: true,
    },
  });

  return assets.map((asset) => ({
    id: asset.id,
    label: asset.originalName,
    publicUrl: asset.publicUrl,
  }));
}

export function getUploadStoragePath(originalName: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const extension = path.extname(originalName).toLowerCase();
  const filename = `${randomUUID()}${extension}`;

  return {
    year,
    month,
    filename,
    extension,
    relativeDirectory: path.join("uploads", year, month),
    relativePath: path.join("uploads", year, month, filename),
  };
}
