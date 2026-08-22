const usdFormatters = new Map<number, Intl.NumberFormat>();
const sharesFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatUsd(value: number, fractionDigits = 2) {
  let formatter = usdFormatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    usdFormatters.set(fractionDigits, formatter);
  }
  return formatter.format(value);
}

export const formatShares = (value: number) => sharesFormatter.format(value);

export function formatDate(value: string, locale: "en" | "zh-tw" | "zh-cn", compact = false) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "zh-tw" ? "zh-TW" : locale === "zh-cn" ? "zh-CN" : "en-GB", {
    day: "numeric",
    month: compact ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatPercent(value: number, fractionDigits = 2) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(fractionDigits)}%`;
}
