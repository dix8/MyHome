export type TemplateMode = "preview" | "published";
export type MediaSourceType = "none" | "local" | "external";
export type SectionKey =
  | "navigation"
  | "hero"
  | "skills"
  | "projects"
  | "contact"
  | "footer"
  | "stats"
  | "links";

export interface ImageAssetRef {
  sourceType: MediaSourceType;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SiteSectionState {
  key: SectionKey;
  title: string;
  isEnabled: boolean;
  sortOrder: number;
  config?: Record<string, unknown>;
}

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
  isEnabled: boolean;
  sortOrder: number;
}

export interface HeroAction {
  label: string;
  href: string;
}

export interface SiteRenderData {
  site: {
    title: string;
    subtitle?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    footerText?: string;
    icp?: {
      text: string;
      url?: string;
    };
    favicon?: ImageAssetRef;
  };
  navigation: NavigationLink[];
  sections: SiteSectionState[];
  hero: {
    greeting?: string;
    name: string;
    titles: string[];
    description?: string;
    avatar?: ImageAssetRef;
    primaryAction?: HeroAction;
    secondaryAction?: HeroAction;
  };
  skills: Array<{
    id: string;
    title: string;
    subtitle?: string;
    sortOrder: number;
    isEnabled: boolean;
    items: Array<{
      id: string;
      name: string;
      level?: number;
      sortOrder: number;
      isEnabled: boolean;
    }>;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    techStack: string[];
    visual: {
      type: "icon" | "cover";
      iconName?: string;
      cover?: ImageAssetRef;
    };
    repoUrl?: string;
    previewUrl?: string;
    isFeatured: boolean;
    sortOrder: number;
    isEnabled: boolean;
  }>;
  contacts: Array<{
    id: string;
    type: string;
    label: string;
    value: string;
    href?: string;
    icon: {
      type: "builtin" | "image";
      name?: string;
      image?: ImageAssetRef;
    };
    openInNewTab: boolean;
    sortOrder: number;
    isEnabled: boolean;
  }>;
}

export type TemplateConfig = Record<string, unknown>;

type BaseField = {
  key: string;
  label: string;
  description?: string;
};

export type TemplateField =
  | (BaseField & {
      type: "text" | "textarea" | "color";
      defaultValue: string;
      placeholder?: string;
    })
  | (BaseField & {
      type: "switch";
      defaultValue: boolean;
    })
  | (BaseField & {
      type: "number" | "slider";
      defaultValue: number;
      min?: number;
      max?: number;
      step?: number;
    })
  | (BaseField & {
      type: "select";
      defaultValue: string;
      options: Array<{ label: string; value: string }>;
    })
  | (BaseField & {
      type: "group";
      fields: TemplateField[];
    });

export interface TemplateSchema {
  sections: Array<{
    key: string;
    title: string;
    description?: string;
    fields: TemplateField[];
  }>;
}

export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  cover: string;
  tags: string[];
  supportedSections: SectionKey[];
  defaultConfig: TemplateConfig;
}

export interface TemplateRenderProps {
  data: SiteRenderData;
  config: TemplateConfig;
  mode?: TemplateMode;
}

export interface TemplateScriptContext {
  root: HTMLElement;
  config: TemplateConfig;
  mode?: TemplateMode;
}

export type TemplateScriptCleanup = () => void;

export interface TemplateScriptModule {
  mountTemplateScripts(
    context: TemplateScriptContext,
  ): TemplateScriptCleanup | void | Promise<TemplateScriptCleanup | void>;
}

export interface TemplateEntryModule {
  default: (props: TemplateRenderProps) => Promise<ReactElement> | ReactElement;
}

export interface TemplateRegistryEntry {
  manifest: () => Promise<TemplateManifest>;
  schema: () => Promise<TemplateSchema>;
  entry: () => Promise<TemplateEntryModule>;
  scripts: () => Promise<TemplateScriptModule>;
}
import type { ReactElement } from "react";
