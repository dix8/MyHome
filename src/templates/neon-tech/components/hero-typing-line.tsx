"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/templates/neon-tech/styles.module.css";

const TYPE_DELAY_MS = 85;
const DELETE_DELAY_MS = 45;
const HOLD_DELAY_MS = 1400;

export function HeroTypingLine({
  titles,
}: {
  titles: string[];
}) {
  const items = useMemo(() => titles.filter((title) => title.trim().length > 0), [titles]);
  const [titleIndex, setTitleIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const currentTitle = items[titleIndex] ?? "";
    const isTypingComplete = visibleLength === currentTitle.length;
    const isDeletingComplete = visibleLength === 0;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && !isTypingComplete) {
          setVisibleLength((value) => Math.min(value + 1, currentTitle.length));
          return;
        }

        if (!isDeleting && isTypingComplete) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !isDeletingComplete) {
          setVisibleLength((value) => Math.max(value - 1, 0));
          return;
        }

        setIsDeleting(false);
        setTitleIndex((value) => (value + 1) % items.length);
      },
      !isDeleting && isTypingComplete ? HOLD_DELAY_MS : isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [isDeleting, items, titleIndex, visibleLength]);

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return <span className={styles.typingLine}>{items[0]}</span>;
  }

  return (
    <span aria-label={items.join(" / ")} className={styles.typingLine}>
      {items[titleIndex]?.slice(0, visibleLength) ?? ""}
      <span aria-hidden className={styles.typingCursor}>
        |
      </span>
    </span>
  );
}
