import type { ReactNode } from "react";

type MetricTone = "plain" | "highlight" | "brand" | "paper";
const tones: Record<MetricTone, string> = {
  plain: "bg-white text-black",
  highlight: "bg-highlight text-brand",
  brand: "bg-brand text-highlight",
  paper: "bg-white text-brand",
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
      className={`min-w-0 min-h-[240px] p-[var(--space-5)] flex flex-col [overflow-wrap:anywhere] compact:min-h-[168px] compact:px-[var(--space-page-gutter)] ${tones[tone]} ${className}`}
    >
      <dt className="text-[length:var(--font-size-label)] leading-[var(--leading-body)] font-bold tracking-[var(--tracking-label)]">
        {label}
      </dt>
      <dd className="kpi-value mt-auto compact:mt-[var(--space-5)]">
        <strong className="block text-[length:var(--font-size-data-kpi)] leading-[var(--leading-data)] font-bold tracking-[var(--tracking-heading)] tabular-nums">
          {value}
        </strong>
      </dd>
      <dd className="kpi-note mt-[14px] compact:mt-[var(--space-2)]">
        <small
          className={`block text-current opacity-[0.62] text-[length:var(--font-size-caption)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-normal compact:max-w-[32ch] ${noteClassName}`}
        >
          {note}
        </small>
      </dd>
    </div>
  );
}
