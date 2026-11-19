"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades and slides its children in the first time they scroll into view.
 * People who prefer reduced motion see the content right away, without animation.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** Milliseconds to wait before animating, for staggered groups. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-[1400ms] motion-safe:ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "motion-safe:translate-y-10 motion-safe:opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
