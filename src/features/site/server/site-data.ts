import { cache } from "react";

import type {
  ContactItem,
  HeroProfile,
  HomeSection,
  MediaAsset,
  NavigationItem,
  Project,
  SiteSettings,
  SiteThemeState as SiteThemeStateModel,
  SkillGroup,
  SkillItem,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";
import type { SiteThemeState } from "@/shared/types/site-theme-state";
import type { ImageAssetRef, SiteRenderData } from "@/templates/types";

import { mockSiteRenderData, mockThemeState } from "./mock-site";

type SkillGroupWithItems = SkillGroup & {
  skillItems: SkillItem[];
};

type ProjectWithMedia = Project & {
  coverMediaAsset: MediaAsset | null;
};

type ContactItemWithMedia = ContactItem & {
  iconMediaAsset: MediaAsset | null;
};

function toImageAssetRef(
  sourceType: "none" | "local" | "external",
  externalUrl: string | null,
  mediaAsset: MediaAsset | null,
): ImageAssetRef | undefined {
  if (sourceType === "local" && mediaAsset) {
    return {
      sourceType: "local",
      url: mediaAsset.publicUrl,
      alt: mediaAsset.altText ?? undefined,
      width: mediaAsset.width ?? undefined,
      height: mediaAsset.height ?? undefined,
    };
  }

  if (sourceType === "external" && externalUrl) {
    return {
      sourceType: "external",
      url: externalUrl,
    };
  }

  return undefined;
}

function mapSiteSettings(siteSettings: SiteSettings | null): SiteRenderData["site"] {
  if (!siteSettings) {
    return mockSiteRenderData.site;
  }

  return {
    title: siteSettings.siteName,
    subtitle: siteSettings.siteSubtitle ?? undefined,
    seoTitle: siteSettings.seoTitle ?? undefined,
    seoDescription: siteSettings.seoDescription ?? undefined,
    seoKeywords: siteSettings.seoKeywords,
    footerText: siteSettings.footerText ?? undefined,
    icp: siteSettings.icpText
      ? {
          text: siteSettings.icpText,
          url: siteSettings.icpUrl ?? undefined,
        }
      : undefined,
  };
}

function mapHero(heroProfile: HeroProfile | null, avatarMediaAsset: MediaAsset | null): SiteRenderData["hero"] {
  if (!heroProfile) {
    return mockSiteRenderData.hero;
  }

  const titles = Array.isArray(heroProfile.typingTitles)
    ? heroProfile.typingTitles.filter((value): value is string => typeof value === "string")
    : mockSiteRenderData.hero.titles;

  return {
    greeting: heroProfile.greeting ?? undefined,
    name: heroProfile.name,
    titles,
    description: heroProfile.description ?? undefined,
    avatar: toImageAssetRef(
      heroProfile.avatarSourceType,
      heroProfile.avatarExternalUrl,
      avatarMediaAsset,
    ),
    primaryAction:
      heroProfile.primaryButtonLabel && heroProfile.primaryButtonHref
        ? {
            label: heroProfile.primaryButtonLabel,
            href: heroProfile.primaryButtonHref,
          }
        : undefined,
    secondaryAction:
      heroProfile.secondaryButtonLabel && heroProfile.secondaryButtonHref
        ? {
            label: heroProfile.secondaryButtonLabel,
            href: heroProfile.secondaryButtonHref,
          }
        : undefined,
  };
}

function mapSections(homeSections: HomeSection[]): SiteRenderData["sections"] {
  if (homeSections.length === 0) {
    return mockSiteRenderData.sections;
  }

  const navigationSection: SiteRenderData["sections"][number] = {
    key: "navigation",
    title: "导航栏",
    isEnabled: true,
    sortOrder: 0,
  };

  const dynamicSections: SiteRenderData["sections"] = homeSections.map((section) => ({
    key: section.sectionKey as SiteRenderData["sections"][number]["key"],
    title:
      section.sectionKey === "hero"
        ? "Hero"
        : section.sectionKey === "skills"
          ? "技能栈"
          : section.sectionKey === "projects"
            ? "项目"
            : section.sectionKey === "contact"
              ? "联系我"
              : "页脚",
    isEnabled: section.isEnabled,
    sortOrder: section.sortOrder,
    config:
      section.sectionConfig && typeof section.sectionConfig === "object"
        ? (section.sectionConfig as Record<string, unknown>)
        : undefined,
  }));

  return [navigationSection, ...dynamicSections].sort((left, right) => left.sortOrder - right.sortOrder);
}

function mapNavigation(navigationItems: NavigationItem[]): SiteRenderData["navigation"] {
  if (navigationItems.length === 0) {
    return mockSiteRenderData.navigation;
  }

  return navigationItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    openInNewTab: item.openInNewTab,
    isEnabled: item.isEnabled,
    sortOrder: item.sortOrder,
  }));
}

function mapSkills(skillGroups: SkillGroupWithItems[]): SiteRenderData["skills"] {
  if (skillGroups.length === 0) {
    return mockSiteRenderData.skills;
  }

  return skillGroups.map((group) => ({
    id: group.id,
    title: group.title,
    subtitle: group.subtitle ?? undefined,
    sortOrder: group.sortOrder,
    isEnabled: group.isEnabled,
    items: group.skillItems.map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level ?? undefined,
      sortOrder: item.sortOrder,
      isEnabled: item.isEnabled,
    })),
  }));
}

function mapProjects(projects: ProjectWithMedia[]): SiteRenderData["projects"] {
  if (projects.length === 0) {
    return mockSiteRenderData.projects;
  }

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    visual: {
      type: project.visualType,
      iconName: project.iconName ?? undefined,
      cover: toImageAssetRef(project.coverSourceType, project.coverExternalUrl, project.coverMediaAsset),
    },
    repoUrl: project.repoUrl ?? undefined,
    previewUrl: project.previewUrl ?? undefined,
    isFeatured: project.isFeatured,
    sortOrder: project.sortOrder,
    isEnabled: project.isEnabled,
  }));
}

function mapContacts(contactItems: ContactItemWithMedia[]): SiteRenderData["contacts"] {
  if (contactItems.length === 0) {
    return mockSiteRenderData.contacts;
  }

  return contactItems.map((contact) => ({
    id: contact.id,
    type: contact.type,
    label: contact.label,
    value: contact.value,
    href: contact.href ?? undefined,
    icon: {
      type: contact.iconType,
      name: contact.iconName ?? undefined,
      image: toImageAssetRef(contact.iconSourceType, contact.iconExternalUrl, contact.iconMediaAsset),
    },
    openInNewTab: contact.openInNewTab,
    sortOrder: contact.sortOrder,
    isEnabled: contact.isEnabled,
  }));
}

function mapThemeState(themeState: SiteThemeStateModel | null): SiteThemeState {
  if (!themeState) {
    return mockThemeState;
  }

  return {
    templateId: themeState.templateId,
    templateConfig:
      themeState.templateConfig && typeof themeState.templateConfig === "object"
        ? (themeState.templateConfig as Record<string, unknown>)
        : mockThemeState.templateConfig,
  };
}

export const getCurrentSite = cache(async () => {
  try {
    const prisma = getPrismaClient();

    const [
      siteSettings,
      heroProfile,
      navigationItems,
      homeSections,
      skillGroups,
      projects,
      contactItems,
      themeState,
    ] = await Promise.all([
      prisma.siteSettings.findFirst(),
      prisma.heroProfile.findFirst({
        include: {
          avatarMediaAsset: true,
        },
      }),
      prisma.navigationItem.findMany({
        orderBy: {
          sortOrder: "asc",
        },
      }),
      prisma.homeSection.findMany({
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
      prisma.project.findMany({
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          coverMediaAsset: true,
        },
      }),
      prisma.contactItem.findMany({
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          iconMediaAsset: true,
        },
      }),
      prisma.siteThemeState.findFirst(),
    ]);

    const result = {
      source: "database" as const,
      data: {
        site: mapSiteSettings(siteSettings),
        navigation: mapNavigation(navigationItems),
        sections: mapSections(homeSections),
        hero: mapHero(heroProfile, heroProfile?.avatarMediaAsset ?? null),
        skills: mapSkills(skillGroups),
        projects: mapProjects(projects),
        contacts: mapContacts(contactItems),
      } satisfies SiteRenderData,
      themeState: mapThemeState(themeState),
    };

    return result;
  } catch (error) {
    console.error("Falling back to mock site data:", error);

    return {
      source: "mock" as const,
      data: mockSiteRenderData,
      themeState: mockThemeState,
    };
  }
});
