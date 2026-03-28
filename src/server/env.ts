function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl() {
  return getRequiredEnv("DATABASE_URL");
}

export function getAuthSecret() {
  const envSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (envSecret) {
    return envSecret;
  }

  throw new Error("Missing required environment variable: AUTH_SECRET or NEXTAUTH_SECRET");
}

export interface DefaultAdminBootstrapConfig {
  displayName: string;
  email: string;
  password: string;
  source: "environment" | "development-default";
}

const DEFAULT_DEV_ADMIN = {
  email: "admin@example.com",
  displayName: "Admin",
  password: "Admin123456!",
} as const;

function getOptionalEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function isAutoBootstrapAdminEnabled() {
  const raw = process.env.AUTO_BOOTSTRAP_ADMIN?.trim().toLowerCase();

  if (!raw) {
    return true;
  }

  return raw !== "0" && raw !== "false" && raw !== "off" && raw !== "no";
}

export function getDefaultAdminBootstrapConfig(): DefaultAdminBootstrapConfig | null {
  if (!isAutoBootstrapAdminEnabled()) {
    return null;
  }

  const email = getOptionalEnv("DEFAULT_ADMIN_EMAIL", "ADMIN_EMAIL");
  const displayName = getOptionalEnv("DEFAULT_ADMIN_NAME", "ADMIN_NAME");
  const password = getOptionalEnv("DEFAULT_ADMIN_PASSWORD", "ADMIN_PASSWORD");

  if (email && displayName && password) {
    return {
      email,
      displayName,
      password,
      source: "environment",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      ...DEFAULT_DEV_ADMIN,
      source: "development-default",
    };
  }

  return null;
}
