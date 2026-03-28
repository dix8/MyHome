import type { TemplateConfig, TemplateField, TemplateManifest, TemplateSchema } from "@/templates/types";

export interface TemplateDefinition {
  manifest: TemplateManifest;
  schema: TemplateSchema;
}

export interface TemplatesFormState {
  status: "idle" | "success" | "error";
  message: string | null;
}

export type TemplateLeafField = Exclude<TemplateField, { type: "group"; fields: TemplateField[] }>;

function flattenFields(fields: TemplateField[]): TemplateLeafField[] {
  const output: TemplateLeafField[] = [];

  for (const field of fields) {
    if (field.type === "group") {
      output.push(...flattenFields(field.fields));
      continue;
    }

    output.push(field);
  }

  return output;
}

export function flattenTemplateSchema(schema: TemplateSchema) {
  return schema.sections.flatMap((section) => flattenFields(section.fields));
}

export function getDefaultTemplateConfig(manifest: TemplateManifest, schema: TemplateSchema): TemplateConfig {
  const config: TemplateConfig = {
    ...manifest.defaultConfig,
  };

  for (const field of flattenTemplateSchema(schema)) {
    if (!(field.key in config)) {
      config[field.key] = field.defaultValue;
    }
  }

  return config;
}
