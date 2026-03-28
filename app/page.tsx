import Link from "next/link";
import type { Metadata } from "next";

import { SiteRenderer } from "@/features/site/components/site-renderer";
import { getSiteMetadataValues } from "@/features/site/server/site-metadata";
import { getCurrentSite } from "@/features/site/server/site-data";

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, seoTitle, description } = await getSiteMetadataValues();

  return {
    title: seoTitle ?? siteTitle,
    description,
  };
}

export default async function HomePage() {
  const { data, themeState } = await getCurrentSite();
  const showAdminShortcut =
    data.sections.find((section) => section.key === "footer")?.config?.showAdminShortcut !== false;

  return (
    <>
      {showAdminShortcut ? (
        <div className="fixed right-4 bottom-4 z-50 hidden lg:block">
          <Link
            className="rounded-full border border-white/10 bg-[var(--bg-panel)] px-4 py-3 text-sm text-white shadow-[var(--shadow-soft)] backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-white/10"
            href="/admin"
          >
            打开后台
          </Link>
        </div>
      ) : null}
      <SiteRenderer data={data} mode="published" themeState={themeState} />
    </>
  );
}
