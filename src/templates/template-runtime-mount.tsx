"use client";

import { useEffect, useRef } from "react";

import type { TemplateConfig, TemplateMode, TemplateScriptCleanup } from "@/templates/types";
import { mountTemplateScripts as mountGlowVisionScripts } from "@/templates/glow-vision/scripts/index";
import { mountTemplateScripts as mountMinimalCardScripts } from "@/templates/minimal-card/scripts/index";
import { mountTemplateScripts as mountNeonTechScripts } from "@/templates/neon-tech/scripts/index";
import { mountTemplateScripts as mountSignalGridScripts } from "@/templates/signal-grid/scripts/index";

const templateScriptMounts = {
  "glow-vision": mountGlowVisionScripts,
  "minimal-card": mountMinimalCardScripts,
  "neon-tech": mountNeonTechScripts,
  "signal-grid": mountSignalGridScripts,
} as const;

export function TemplateRuntimeMount({
  children,
  config,
  mode,
  templateId,
}: Readonly<{
  children: React.ReactNode;
  config: TemplateConfig;
  mode?: TemplateMode;
  templateId: string;
}>) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mountTemplateScripts = templateScriptMounts[templateId as keyof typeof templateScriptMounts];

    if (!root || !mountTemplateScripts) {
      return;
    }

    let cleanup: TemplateScriptCleanup | void;

    try {
      cleanup = mountTemplateScripts({
        root,
        config,
        mode,
      });
    } catch (error) {
      console.error(`Failed to mount template scripts for "${templateId}":`, error);
    }

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [config, mode, templateId]);

  return <div ref={rootRef}>{children}</div>;
}
