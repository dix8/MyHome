import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { upsertAdminUser } from "../src/server/auth/admin-user";
import { getDatabaseUrl } from "../src/server/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function readOption(optionName: string) {
  const optionIndex = process.argv.indexOf(optionName);

  if (optionIndex === -1) {
    return undefined;
  }

  return process.argv[optionIndex + 1];
}

function requireOption(optionName: string, fallbackEnvNames: string[] = []) {
  const fromArg = readOption(optionName);

  if (fromArg) {
    return fromArg;
  }

  for (const envName of fallbackEnvNames) {
    if (process.env[envName]) {
      return process.env[envName] as string;
    }
  }

  throw new Error(`Missing required option: ${optionName}`);
}

async function main() {
  const email = requireOption("--email", ["DEFAULT_ADMIN_EMAIL", "ADMIN_EMAIL"]).trim().toLowerCase();
  const password = requireOption("--password", ["DEFAULT_ADMIN_PASSWORD", "ADMIN_PASSWORD"]);
  const displayName = requireOption("--name", ["DEFAULT_ADMIN_NAME", "ADMIN_NAME"]);

  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const user = await upsertAdminUser(prisma, {
      email,
      displayName,
      password,
    });

    console.log(`Admin user ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
