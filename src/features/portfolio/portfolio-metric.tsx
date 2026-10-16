import type { ReactNode } from "react";

type MetricTone = "plain" | "highlight" | "brand" | "paper";
const tones: Record<MetricTone, string> = {
  plain: "bg-surface text-ink",
  highlight: "bg-highlight text-brand",
  brand: "bg-brand text-highlight",
  paper: "bg-surface text-brand",
};

export function PortfolioMetric({
  label,
  value,
  note,
  tone,
  className = "",
  noteClassName = "",
}: {
  label: ReactNode;
  value: ReactNode;
  note: ReactNode;
  tone: MetricTone;
  className?: string;
  noteClassName?: string;
}) {
  return (
    <div
      data-tone={tone}
      className={`flex min-h-[240px] min-w-0 flex-col rounded-surface p-[var(--space-5)] [overflow-wrap:anywhere] compact:min-h-[168px] compact:px-[var(--space-page-gutter)] ${tones[tone]} ${className}`}
    >
      <dt className="text-label">{label}</dt>
      <dd className="kpi-value mt-auto compact:mt-[var(--space-5)]">
        <strong className="block text-data-kpi tabular-nums">{value}</strong>
      </dd>
      <dd className="kpi-note mt-[14px] compact:mt-[var(--space-2)]">
        <small className={`block text-caption opacity-[0.8] compact:max-w-[32ch] ${noteClassName}`}>{note}</small>
      </dd>
    </div>
  );
}
