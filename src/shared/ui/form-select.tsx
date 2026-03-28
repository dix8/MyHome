"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

export interface FormSelectOption {
  label: string;
  value: string;
  imageUrl?: string;
}

export function FormSelect({
  className,
  defaultValue,
  disabled = false,
  name,
  onValueChange,
  options,
  placeholder,
}: {
  className?: string;
  defaultValue: string;
  disabled?: boolean;
  name: string;
  onValueChange?: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function emitChange() {
    if (!hiddenInputRef.current) {
      return;
    }

    hiddenInputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    hiddenInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function handleSelect(nextValue: string) {
    if (disabled) {
      return;
    }

    setValue(nextValue);
    setIsOpen(false);
    onValueChange?.(nextValue);

    window.setTimeout(() => {
      emitChange();
    }, 0);
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <input name={name} ref={hiddenInputRef} type="hidden" value={value} />
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 px-4 text-left text-sm text-white outline-none transition",
          "focus:border-cyan-400/30 focus:bg-white/8",
          disabled ? "cursor-not-allowed opacity-50" : "hover:border-white/20 hover:bg-white/8",
        )}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          {selectedOption?.imageUrl ? (
            <span className="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-[8px] border border-white/10 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="h-full w-full object-cover" src={selectedOption.imageUrl} />
            </span>
          ) : null}
          <span className={cn("truncate", selectedOption ? "text-white" : "text-[var(--text-muted)]")}>
            {selectedOption?.label ?? placeholder ?? "请选择"}
          </span>
        </div>
        <svg
          aria-hidden
          className={cn("h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform", isOpen ? "rotate-180" : "")}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-[var(--radius-md)] border border-white/10 bg-[#151b2c] p-2 shadow-[var(--shadow-panel)]"
          id={listboxId}
          role="listbox"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                aria-selected={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition",
                  selected
                    ? "bg-cyan-400/12 text-cyan-100"
                    : "text-[var(--text-secondary)] hover:bg-white/6 hover:text-white",
                )}
                key={option.value}
                onClick={() => handleSelect(option.value)}
                role="option"
                type="button"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {option.imageUrl ? (
                    <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-[10px] border border-white/10 bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" className="h-full w-full object-cover" src={option.imageUrl} />
                    </span>
                  ) : null}
                  <span className="truncate">{option.label}</span>
                </div>
                {selected ? (
                  <svg aria-hidden className="h-4 w-4 text-cyan-300" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m5 12 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
