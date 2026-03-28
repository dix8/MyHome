"use client";

import { useState } from "react";

export function ConfirmActionButton({
  children,
  confirmLabel = "确认执行",
  confirmText = "确定继续吗？",
  disabled = false,
  formAction,
  variant = "secondary",
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  variant?: "secondary" | "danger";
}) {
  const [confirming, setConfirming] = useState(false);

  const baseClass =
    "inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-medium transition";
  const variantClass =
    variant === "danger"
      ? "border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10";

  if (disabled) {
    return (
      <button
        className={`${baseClass} ${variantClass} cursor-not-allowed opacity-40`}
        disabled
        type="button"
      >
        {children}
      </button>
    );
  }

  if (!confirming) {
    return (
      <button
        className={`${baseClass} ${variantClass}`}
        onClick={() => setConfirming(true)}
        type="button"
      >
        {children}
      </button>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="rounded-[var(--radius-sm)] border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
        {confirmText}
      </div>
      <div className="flex gap-2">
        <button className={`${baseClass} ${variantClass}`} formAction={formAction} type="submit">
          {confirmLabel}
        </button>
        <button
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
          onClick={() => setConfirming(false)}
          type="button"
        >
          取消
        </button>
      </div>
    </div>
  );
}
