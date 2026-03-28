import type { PrismaClient } from "@/generated/prisma/client";
import { hashPassword } from "@/server/auth/password";

export interface AdminBootstrapInput {
  email: string;
  displayName: string;
  password: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function upsertAdminUser(prisma: PrismaClient, input: AdminBootstrapInput) {
  return prisma.user.upsert({
    where: {
      email: normalizeEmail(input.email),
    },
    update: {
      displayName: input.displayName,
      passwordHash: hashPassword(input.password),
      isActive: true,
    },
    create: {
      email: normalizeEmail(input.email),
      displayName: input.displayName,
      passwordHash: hashPassword(input.password),
      isActive: true,
    },
  });
}
