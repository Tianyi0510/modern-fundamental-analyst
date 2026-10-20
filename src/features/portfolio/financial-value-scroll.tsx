"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const hints: Record<Locale, string> = {
  en: "Scroll to View Full Value",
  "zh-tw": "左右滑動查看完整數值",
  "zh-cn": "左右滑动查看完整数值",
};

export function FinancialValueScroll({
  labelId,
  locale,
  children,
}: {
  labelId: string;
  locale: Locale;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const region = ref.current;
    if (!region) return;
    const measure = () => setOverflow(region.scrollWidth > region.clientWidth + 1);
    // ResizeObserver is unavailable in some test environments; measure once and skip live updates there.
    if (typeof ResizeObserver === "undefined") {
      measure();
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    if (region.firstElementChild) observer.observe(region.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div
        ref={ref}
        className="financial-value-scroll max-w-full overflow-x-auto overflow-y-hidden"
        role="region"
        aria-labelledby={labelId}
        aria-describedby={overflow ? `${labelId}-hint` : undefined}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Overflowing native scroll regions need keyboard focus.
        tabIndex={overflow ? 0 : undefined}
      >
        {children}
      </div>
      {overflow && (
        <span id={`${labelId}-hint`} className="financial-scroll-hint mt-2 flex items-center gap-2 text-small-body">
          <ArrowLeftRight aria-hidden="true" className="size-4 shrink-0" />
          {hints[locale]}
        </span>
      )}
    </>
  );
}
