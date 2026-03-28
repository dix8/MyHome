import { cn } from "@/shared/lib/cn";

const toneClasses = {
  neutral: "border-white/10 bg-white/6 text-[var(--text-secondary)]",
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  danger: "border-rose-400/20 bg-rose-500/10 text-rose-300",
  brand: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
} as const;

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
