import type { TemplateManifest, TemplateRegistryEntry } from "@/templates/types";

export const templateRegistry = {
  "glow-vision": {
    manifest: () => import("./glow-vision/manifest").then((module) => module.manifest),
    schema: () => import("./glow-vision/schema").then((module) => module.schema),
    entry: () => import("./glow-vision/entry"),
    scripts: () => import("./glow-vision/scripts/index"),
  },
  "neon-tech": {
    manifest: () => import("./neon-tech/manifest").then((module) => module.manifest),
    schema: () => import("./neon-tech/schema").then((module) => module.schema),
    entry: () => import("./neon-tech/entry"),
    scripts: () => import("./neon-tech/scripts/index"),
  },
  "minimal-card": {
    manifest: () => import("./minimal-card/manifest").then((module) => module.manifest),
    schema: () => import("./minimal-card/schema").then((module) => module.schema),
    entry: () => import("./minimal-card/entry"),
    scripts: () => import("./minimal-card/scripts/index"),
  },
  "signal-grid": {
    manifest: () => import("./signal-grid/manifest").then((module) => module.manifest),
    schema: () => import("./signal-grid/schema").then((module) => module.schema),
    entry: () => import("./signal-grid/entry"),
    scripts: () => import("./signal-grid/scripts/index"),
  },
} satisfies Record<string, TemplateRegistryEntry>;

export type TemplateId = keyof typeof templateRegistry;

export async function loadTemplateManifestList() {
  const manifests = await Promise.all(
    Object.values(templateRegistry).map((entry) => entry.manifest()),
  );

  return manifests.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
}

export function isTemplateId(value: string): value is TemplateId {
  return value in templateRegistry;
}

export async function resolveTemplateManifest(templateId: string): Promise<TemplateManifest | null> {
  if (!isTemplateId(templateId)) {
    return null;
  }

  return templateRegistry[templateId].manifest();
}
