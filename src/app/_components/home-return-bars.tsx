import { formatPercent } from "@/lib/format";

type Series = { name: string; value: number };

export function HomeReturnBars({ label, series }: { label: string; series: [Series, Series] }) {
  const values = series.map(({ value }) => value);
  const maximum = Math.max(0, ...values);
  const minimum = Math.min(0, ...values);
  const range = maximum - minimum;
  const zero = range ? (maximum / range) * 100 : 50;
  const columns = "grid grid-cols-2 gap-[var(--space-16px)] px-[var(--space-16px)]";

  return (
    <div
      role="group"
      aria-label={label}
      className="performance-bars min-w-0 border-l border-[var(--chart-axis-border)]"
    >
      <div className="py-[calc(1.5em+var(--space-8px))] text-small-body">
        <div className={`relative h-48 sm:h-64 ${columns}`}>
          <div
            aria-hidden="true"
            className="return-zero absolute inset-x-0 border-t border-[var(--chart-axis-border)]"
            style={{ top: `${zero}%` }}
          />
          {series.map(({ name, value }, index) => {
            const height = range ? (Math.abs(value) / range) * 100 : 0;
            const top = value > 0 ? zero - height : zero;
            return (
              <div key={name} className="relative min-w-0 text-center">
                <div
                  className={`bar-value absolute inset-x-0 ${index === 0 ? "bg-[var(--interactive-accent)]" : "bg-[var(--blue-bright)]"}`}
                  style={{ top: `${top}%`, height: `${height}%` }}
                >
                  <span
                    className={`absolute inset-x-0 whitespace-nowrap tabular-nums ${value < 0 ? "top-full pt-1" : "bottom-full pb-1"}`}
                  >
                    <span className="sr-only">{name} </span>
                    {formatPercent(value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div aria-hidden="true" className={`${columns} text-center`}>
        {series.map(({ name }) => (
          <div key={name} className="year-bar min-w-0">
            <small className="text-small-body text-[var(--text-chart-secondary)]">{name}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
