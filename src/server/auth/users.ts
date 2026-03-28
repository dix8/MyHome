import { getPrismaClient } from "@/server/db/client";
import { verifyPassword } from "@/server/auth/password";

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function authenticateAdminUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
  } satisfies AuthenticatedAdminUser;
}
