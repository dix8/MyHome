import type { MediaOption } from "@/features/admin/server/media";
import { getMediaOptions } from "@/features/admin/server/media";
import type { PrismaClient } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";

import { getCurrentAdmin, type SettingsFormState } from "./settings";

export interface ContentPageData {
  sections: Array<{
    id: string;
    key: "hero" | "skills" | "projects" | "contact" | "footer";
    title: string;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  footerSectionId: string | null;
  showAdminShortcut: boolean;
  navigation: Array<{
    id: string;
    label: string;
    href: string;
    openInNewTab: boolean;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  heroProfile: {
    greeting: string;
    name: string;
    description: string;
    titles: string;
    avatarSourceType: "none" | "local" | "external";
    avatarMediaAssetId: string;
    avatarExternalUrl: string;
    primaryButtonLabel: string;
    primaryButtonHref: string;
    secondaryButtonLabel: string;
    secondaryButtonHref: string;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    visualType: "icon" | "cover";
    iconName: string;
    coverSourceType: "none" | "local" | "external";
    coverMediaAssetId: string;
    coverExternalUrl: string;
    repoUrl: string;
    previewUrl: string;
    techStack: string;
    isFeatured: boolean;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  skillGroups: Array<{
    id: string;
    title: string;
    subtitle: string;
    isEnabled: boolean;
    sortOrder: number;
    items: Array<{
      id: string;
      name: string;
      level: string;
      isEnabled: boolean;
      sortOrder: number;
    }>;
  }>;
  contacts: Array<{
    id: string;
    type: string;
    label: string;
    value: string;
    href: string;
    iconType: "builtin" | "image";
    iconName: string;
    iconSourceType: "none" | "local" | "external";
    iconMediaAssetId: string;
    iconExternalUrl: string;
    openInNewTab: boolean;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  mediaOptions: MediaOption[];
  account: {
    email: string;
    displayName: string;
  };
}

export type ContentFormState = SettingsFormState;

function sectionTitle(sectionKey: "hero" | "skills" | "projects" | "contact" | "footer") {
  switch (sectionKey) {
    case "hero":
      return "Hero";
    case "skills":
      return "技能栈";
    case "projects":
      return "项目";
    case "contact":
      return "联系我";
    case "footer":
      return "页脚";
  }
}

function titlesToMultiline(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.filter((item): item is string => typeof item === "string").join("\n");
}

export async function getContentPageData(): Promise<ContentPageData> {
  const prisma = getPrismaClient();
  const [currentUser, sections, navigation, heroProfile, projects, skillGroups, contacts, mediaOptions] = await Promise.all([
    getCurrentAdmin(prisma),
    prisma.homeSection.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
    prisma.navigationItem.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
    prisma.heroProfile.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.project.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
    prisma.skillGroup.findMany({
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        skillItems: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    }),
    prisma.contactItem.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
    getMediaOptions(),
  ]);

  return {
    sections: sections.map((section) => ({
      id: section.id,
      key: section.sectionKey,
      title: sectionTitle(section.sectionKey),
      isEnabled: section.isEnabled,
      sortOrder: section.sortOrder,
    })),
    footerSectionId: sections.find((section) => section.sectionKey === "footer")?.id ?? null,
    showAdminShortcut:
      (
        sections.find((section) => section.sectionKey === "footer")?.sectionConfig as
          | { showAdminShortcut?: unknown }
          | null
          | undefined
      )?.showAdminShortcut !== false,
    navigation: navigation.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      openInNewTab: item.openInNewTab,
      isEnabled: item.isEnabled,
      sortOrder: item.sortOrder,
    })),
    heroProfile: {
      greeting: heroProfile?.greeting ?? "",
      name: heroProfile?.name ?? "",
      description: heroProfile?.description ?? "",
      titles: titlesToMultiline(heroProfile?.typingTitles),
      avatarSourceType: heroProfile?.avatarSourceType ?? "none",
      avatarMediaAssetId: heroProfile?.avatarMediaAssetId ?? "",
      avatarExternalUrl: heroProfile?.avatarExternalUrl ?? "",
      primaryButtonLabel: heroProfile?.primaryButtonLabel ?? "",
      primaryButtonHref: heroProfile?.primaryButtonHref ?? "",
      secondaryButtonLabel: heroProfile?.secondaryButtonLabel ?? "",
      secondaryButtonHref: heroProfile?.secondaryButtonHref ?? "",
    },
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      visualType: project.visualType,
      iconName: project.iconName ?? "",
      coverSourceType: project.coverSourceType,
      coverMediaAssetId: project.coverMediaAssetId ?? "",
      coverExternalUrl: project.coverExternalUrl ?? "",
      repoUrl: project.repoUrl ?? "",
      previewUrl: project.previewUrl ?? "",
      techStack: project.techStack.join(", "),
      isFeatured: project.isFeatured,
      isEnabled: project.isEnabled,
      sortOrder: project.sortOrder,
    })),
    skillGroups: skillGroups.map((group) => ({
      id: group.id,
      title: group.title,
      subtitle: group.subtitle ?? "",
      isEnabled: group.isEnabled,
      sortOrder: group.sortOrder,
      items: group.skillItems.map((item) => ({
        id: item.id,
        name: item.name,
        level: item.level === null ? "" : String(item.level),
        isEnabled: item.isEnabled,
        sortOrder: item.sortOrder,
      })),
    })),
    contacts: contacts.map((contact) => ({
      id: contact.id,
      type: contact.type,
      label: contact.label,
      value: contact.value,
      href: contact.href ?? "",
      iconType: contact.iconType,
      iconName: contact.iconName ?? "",
      iconSourceType: contact.iconSourceType,
      iconMediaAssetId: contact.iconMediaAssetId ?? "",
      iconExternalUrl: contact.iconExternalUrl ?? "",
      openInNewTab: contact.openInNewTab,
      isEnabled: contact.isEnabled,
      sortOrder: contact.sortOrder,
    })),
    mediaOptions,
    account: {
      email: currentUser.email,
      displayName: currentUser.displayName,
    },
  };
}

export async function requireContentAdmin(prisma: PrismaClient) {
  return getCurrentAdmin(prisma);
}
