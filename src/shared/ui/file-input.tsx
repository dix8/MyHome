"use client";

import { useId, useState } from "react";

import { cn } from "@/shared/lib/cn";

export function FileInput({
  accept,
  className,
  label = "选择文件",
  name,
  required = false,
}: {
  accept?: string;
  className?: string;
  label?: string;
  name: string;
  required?: boolean;
}) {
  const inputId = useId();
  const [fileName, setFileName] = useState("未选择文件");

  return (
    <div className={cn("relative", className)}>
      <input
        accept={accept}
        className="peer sr-only"
        id={inputId}
        name={name}
        onChange={(event) => {
          const selectedFile = event.currentTarget.files?.[0];
          setFileName(selectedFile?.name ?? "未选择文件");
        }}
        required={required}
        type="file"
      />
      <label
        className="flex h-12 w-full cursor-pointer items-center gap-4 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 text-sm text-white transition hover:border-white/20 hover:bg-white/8 peer-focus-within:border-cyan-400/30 peer-focus-within:bg-white/8"
        htmlFor={inputId}
      >
        <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15">
          {label}
        </span>
        <span className="min-w-0 truncate text-base leading-none text-white/92">{fileName}</span>
      </label>
    </div>
  );
}
