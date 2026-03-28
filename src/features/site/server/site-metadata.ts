import { cache } from "react";

import { getPrismaClient } from "@/server/db/client";

export interface SiteMetadataValues {
  siteTitle: string;
  seoTitle?: string;
  description: string;
}

const fallbackMetadata: SiteMetadataValues = {
  siteTitle: "myhome",
  seoTitle: "myhome",
  description: "Template-driven personal homepage system with an editorial admin workspace.",
};

export const getSiteMetadataValues = cache(async (): Promise<SiteMetadataValues> => {
  try {
    const prisma = getPrismaClient();
    const siteSettings = await prisma.siteSettings.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        siteName: true,
        seoTitle: true,
        seoDescription: true,
      },
    });

    if (!siteSettings) {
      return fallbackMetadata;
    }

    return {
      siteTitle: siteSettings.siteName || fallbackMetadata.siteTitle,
      seoTitle: siteSettings.seoTitle ?? undefined,
      description: siteSettings.seoDescription ?? fallbackMetadata.description,
    };
  } catch (error) {
    console.error("Falling back to default site metadata:", error);
    return fallbackMetadata;
  }
});
