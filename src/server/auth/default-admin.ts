import type { PrismaClient, User } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/client";
import { getDefaultAdminBootstrapConfig } from "@/server/env";

import { upsertAdminUser } from "./admin-user";

const globalForDefaultAdmin = globalThis as {
  ensureDefaultAdminPromise?: Promise<User | null>;
};

export async function ensureDefaultAdminUser(prismaArg?: PrismaClient) {
  if (!globalForDefaultAdmin.ensureDefaultAdminPromise) {
    globalForDefaultAdmin.ensureDefaultAdminPromise = (async () => {
      const bootstrapConfig = getDefaultAdminBootstrapConfig();

      if (!bootstrapConfig) {
        return null;
      }

      const prisma = prismaArg ?? getPrismaClient();
      const existingUserCount = await prisma.user.count();

      if (existingUserCount > 0) {
        return null;
      }

      return upsertAdminUser(prisma, {
        email: bootstrapConfig.email,
        displayName: bootstrapConfig.displayName,
        password: bootstrapConfig.password,
      });
    })();
  }

  try {
    return await globalForDefaultAdmin.ensureDefaultAdminPromise;
  } finally {
    globalForDefaultAdmin.ensureDefaultAdminPromise = undefined;
  }
}
