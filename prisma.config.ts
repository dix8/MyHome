import nextEnv from "@next/env";
import { defineConfig } from "prisma/config";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const buildTimeFallbackDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:5432/myhome";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` only needs a syntactically valid URL during image build.
    // Real migrations and runtime still rely on DATABASE_URL from the deployment environment.
    url: process.env.DATABASE_URL ?? buildTimeFallbackDatabaseUrl,
  },
});
