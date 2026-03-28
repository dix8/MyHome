import type { Metadata } from "next";

import { getSiteMetadataValues } from "@/features/site/server/site-metadata";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, description } = await getSiteMetadataValues();

  return {
    title: siteTitle,
    description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-base)] font-sans text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
