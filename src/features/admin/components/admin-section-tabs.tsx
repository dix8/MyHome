import Link from "next/link";

import { cn } from "@/shared/lib/cn";

export interface AdminSectionTab {
  href: string;
  label: string;
  description: string;
}

export function AdminSectionTabs({
  activeHref,
  tabs,
}: {
  activeHref: string;
  tabs: AdminSectionTab[];
}) {
  const activeTab = tabs.find((tab) => tab.href === activeHref) ?? tabs[0];

  return (
    <div className="mb-5 rounded-[var(--radius-lg)] border border-white/10 bg-white/4 p-3 xl:sticky xl:top-24 xl:z-10 xl:backdrop-blur-xl">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const active = tab.href === activeHref;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              key={tab.href}
              className={cn(
                "snap-start shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "border-cyan-400/20 bg-linear-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 text-white shadow-[var(--glow-brand)]"
                  : "border-white/10 bg-white/4 text-[var(--text-secondary)] hover:border-white/20 hover:bg-white/8 hover:text-white",
              )}
              href={tab.href}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {activeTab ? (
        <div className="mt-3 flex items-start gap-3 rounded-[var(--radius-md)] border border-white/10 bg-black/10 px-4 py-3">
          <span className="mt-0.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400/70" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{activeTab.label}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{activeTab.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
