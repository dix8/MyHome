import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";

import { HomeSectionKey, Prisma, PrismaClient } from "../src/generated/prisma/client";
import { mockSiteRenderData, mockThemeState } from "../src/features/site/server/mock-site";
import { upsertAdminUser } from "../src/server/auth/admin-user";
import { getDatabaseUrl } from "../src/server/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_NAME = "Admin";
const DEFAULT_ADMIN_PASSWORD = "Admin123456!";

function readOption(optionName: string) {
  const optionIndex = process.argv.indexOf(optionName);

  if (optionIndex === -1) {
    return undefined;
  }

  return process.argv[optionIndex + 1];
}

function optionalValue(optionName: string, envNames: string[], fallback: string) {
  const fromArg = readOption(optionName);

  if (fromArg) {
    return fromArg;
  }

  for (const envName of envNames) {
    const value = process.env[envName];

    if (value) {
      return value;
    }
  }

  return fallback;
}

async function ensureSiteSettings(prisma: PrismaClient) {
  const existing = await prisma.siteSettings.findFirst({
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.siteSettings.create({
    data: {
      siteName: mockSiteRenderData.site.title,
      siteSubtitle: mockSiteRenderData.site.subtitle,
      seoTitle: mockSiteRenderData.site.seoTitle,
      seoDescription: mockSiteRenderData.site.seoDescription,
      seoKeywords: mockSiteRenderData.site.seoKeywords ?? [],
      footerText: mockSiteRenderData.site.footerText,
      icpText: mockSiteRenderData.site.icp?.text,
      icpUrl: mockSiteRenderData.site.icp?.url,
    },
  });
}

async function ensureHeroProfile(prisma: PrismaClient) {
  const existing = await prisma.heroProfile.findFirst({
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.heroProfile.create({
    data: {
      greeting: mockSiteRenderData.hero.greeting,
      name: mockSiteRenderData.hero.name,
      typingTitles: mockSiteRenderData.hero.titles,
      description: mockSiteRenderData.hero.description,
      avatarSourceType: mockSiteRenderData.hero.avatar?.sourceType ?? "none",
      avatarExternalUrl: mockSiteRenderData.hero.avatar?.url,
      primaryButtonLabel: mockSiteRenderData.hero.primaryAction?.label,
      primaryButtonHref: mockSiteRenderData.hero.primaryAction?.href,
      secondaryButtonLabel: mockSiteRenderData.hero.secondaryAction?.label,
      secondaryButtonHref: mockSiteRenderData.hero.secondaryAction?.href,
    },
  });
}

async function ensureHomeSections(prisma: PrismaClient) {
  const count = await prisma.homeSection.count();

  if (count > 0) {
    return count;
  }

  await prisma.homeSection.createMany({
    data: mockSiteRenderData.sections
      .filter(
        (
          section,
        ): section is (typeof mockSiteRenderData.sections)[number] & {
          key: Exclude<(typeof section.key), "navigation">;
        } => section.key !== "navigation",
      )
      .map((section) => ({
        sectionKey: section.key as HomeSectionKey,
        isEnabled: section.isEnabled,
        sortOrder: section.sortOrder,
        sectionConfig: (section.config ?? {}) as Prisma.InputJsonValue,
      })),
  });

  return prisma.homeSection.count();
}

async function ensureNavigation(prisma: PrismaClient) {
  const count = await prisma.navigationItem.count();

  if (count > 0) {
    return count;
  }

  await prisma.navigationItem.createMany({
    data: mockSiteRenderData.navigation.map((item) => ({
      label: item.label,
      href: item.href,
      openInNewTab: item.openInNewTab,
      sortOrder: item.sortOrder,
      isEnabled: item.isEnabled,
    })),
  });

  return prisma.navigationItem.count();
}

async function ensureSkills(prisma: PrismaClient) {
  const count = await prisma.skillGroup.count();

  if (count > 0) {
    return count;
  }

  for (const group of mockSiteRenderData.skills) {
    await prisma.skillGroup.create({
      data: {
        title: group.title,
        subtitle: group.subtitle,
        sortOrder: group.sortOrder,
        isEnabled: group.isEnabled,
        skillItems: {
          create: group.items.map((item) => ({
            name: item.name,
            level: item.level,
            sortOrder: item.sortOrder,
            isEnabled: item.isEnabled,
          })),
        },
      },
    });
  }

  return prisma.skillGroup.count();
}

async function ensureProjects(prisma: PrismaClient) {
  const count = await prisma.project.count();

  if (count > 0) {
    return count;
  }

  await prisma.project.createMany({
    data: mockSiteRenderData.projects.map((project) => ({
      title: project.title,
      description: project.description,
      visualType: project.visual.type,
      iconName: project.visual.iconName,
      coverSourceType: project.visual.cover?.sourceType ?? "none",
      coverExternalUrl: project.visual.cover?.url,
      repoUrl: project.repoUrl,
      previewUrl: project.previewUrl,
      techStack: project.techStack,
      isFeatured: project.isFeatured,
      sortOrder: project.sortOrder,
      isEnabled: project.isEnabled,
    })),
  });

  return prisma.project.count();
}

async function ensureContacts(prisma: PrismaClient) {
  const count = await prisma.contactItem.count();

  if (count > 0) {
    return count;
  }

  await prisma.contactItem.createMany({
    data: mockSiteRenderData.contacts.map((contact) => ({
      type: contact.type,
      label: contact.label,
      value: contact.value,
      href: contact.href,
      iconType: contact.icon.type,
      iconName: contact.icon.name,
      iconSourceType: contact.icon.image?.sourceType ?? "none",
      iconExternalUrl: contact.icon.image?.url,
      openInNewTab: contact.openInNewTab,
      sortOrder: contact.sortOrder,
      isEnabled: contact.isEnabled,
    })),
  });

  return prisma.contactItem.count();
}

async function ensureThemeState(prisma: PrismaClient) {
  const existing = await prisma.siteThemeState.findFirst({
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.siteThemeState.create({
    data: {
      templateId: mockThemeState.templateId,
      templateConfig: mockThemeState.templateConfig as Prisma.InputJsonValue,
      publishedSnapshotId: null,
    },
  });
}

async function main() {
  const adminEmail = optionalValue("--email", ["DEFAULT_ADMIN_EMAIL", "ADMIN_EMAIL"], DEFAULT_ADMIN_EMAIL);
  const adminName = optionalValue("--name", ["DEFAULT_ADMIN_NAME", "ADMIN_NAME"], DEFAULT_ADMIN_NAME);
  const adminPassword = optionalValue(
    "--password",
    ["DEFAULT_ADMIN_PASSWORD", "ADMIN_PASSWORD"],
    DEFAULT_ADMIN_PASSWORD,
  );

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  const prisma = new PrismaClient({ adapter });

  try {
    await ensureSiteSettings(prisma);
    await ensureHeroProfile(prisma);
    await ensureHomeSections(prisma);
    await ensureNavigation(prisma);
    await ensureSkills(prisma);
    await ensureProjects(prisma);
    await ensureContacts(prisma);
    await ensureThemeState(prisma);

    const user = await upsertAdminUser(prisma, {
      email: adminEmail,
      displayName: adminName,
      password: adminPassword,
    });

    console.log("Development setup complete.");
    console.log(`Admin email: ${user.email}`);
    console.log(`Admin password: ${adminPassword}`);
    console.log("Seeded site content: ready");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
