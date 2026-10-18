import { FinancialValueScroll } from "./financial-value-scroll";
import styles from "./portfolio-metric.module.css";
import type { Locale } from "@/lib/i18n";
import { brandSurface } from "@/components/brand-surface";
import { useId, type ReactNode } from "react";

type MetricTone = "plain" | "highlight" | "brand" | "paper";
const tones: Record<MetricTone, string> = {
  plain: "bg-surface text-ink",
  highlight: `bg-highlight text-brand ${brandSurface}`,
  brand: "bg-[var(--surface-brand)] text-highlight",
  paper: "bg-surface text-brand",
};

export function PortfolioMetric({
  locale,
  label,
  value,
  note,
  tone,
  className = "",
  noteClassName = "",
}: {
  locale: Locale;
  label: ReactNode;
  value: ReactNode;
  note: ReactNode;
  tone: MetricTone;
  className?: string;
  noteClassName?: string;
}) {
  const labelId = useId();
  return (
    <div
      data-tone={tone}
      className={`${styles.metric} flex min-h-[200px] min-w-0 flex-col rounded-surface p-[var(--space-6)] [overflow-wrap:anywhere] compact:min-h-[168px] compact:px-[var(--space-page-gutter)] compact:py-[var(--space-5)] ${tones[tone]} ${className}`}
    >
      <dt id={labelId} className="text-large-label">
        {label}
      </dt>
      <dd className="kpi-value mt-[var(--space-4)] min-w-0">
        <FinancialValueScroll labelId={labelId} locale={locale}>
          <strong className="block w-max min-w-full text-medium-display whitespace-nowrap tabular-nums [--font-size-medium-display:3.1875rem]">
            {value}
          </strong>
        </FinancialValueScroll>
      </dd>
      <dd className="kpi-note mt-[var(--space-3)]">
        <small className={`block text-small-body opacity-[0.8] compact:max-w-[32ch] ${noteClassName}`}>{note}</small>
      </dd>
    </div>
  );
}
