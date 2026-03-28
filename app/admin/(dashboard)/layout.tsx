import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { getSiteMetadataValues } from "@/features/site/server/site-metadata";
import { getPrismaClient } from "@/server/db/client";
import { auth } from "@/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle } = await getSiteMetadataValues();

  return {
    title: {
      default: `${siteTitle} 后台`,
      template: `%s | ${siteTitle} 后台`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const prisma = getPrismaClient();
  const currentUser = session.user.id
    ? await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
      })
    : null;

  return (
    <div className="min-h-screen xl:grid xl:h-screen xl:grid-cols-[280px_minmax(0,1fr)] xl:overflow-hidden">
      <AdminSidebar
        userEmail={currentUser?.email ?? session.user.email}
        userName={currentUser?.displayName ?? session.user.name}
      />
      <div className="min-w-0 xl:h-screen xl:overflow-y-auto">{children}</div>
    </div>
  );
}
