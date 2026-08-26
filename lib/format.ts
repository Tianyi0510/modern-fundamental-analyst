const usdFormatters = new Map<number, Intl.NumberFormat>();
const percentFormatters = new Map<number, Intl.NumberFormat>();
const sharesFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const MAX_CACHED_FRACTION_DIGITS = 4;

function shouldCacheFormatter(fractionDigits: number) {
  return Number.isInteger(fractionDigits) && fractionDigits >= 0 && fractionDigits <= MAX_CACHED_FRACTION_DIGITS;
}

export function formatUsd(value: number, fractionDigits = 2) {
  const shouldCache = shouldCacheFormatter(fractionDigits);
  let formatter = shouldCache ? usdFormatters.get(fractionDigits) : undefined;
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    if (shouldCache) usdFormatters.set(fractionDigits, formatter);
  }
  return formatter.format(value);
}

export const formatShares = (value: number) => sharesFormatter.format(value);

export function formatDate(value: string, locale: "en" | "zh-tw" | "zh-cn", compact = false) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid ISO date: ${value}`);

  return new Intl.DateTimeFormat(locale === "zh-tw" ? "zh-TW" : locale === "zh-cn" ? "zh-CN" : "en-GB", {
    day: "numeric",
    month: compact ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatPercent(value: number, fractionDigits = 2) {
  const shouldCache = shouldCacheFormatter(fractionDigits);
  let formatter = shouldCache ? percentFormatters.get(fractionDigits) : undefined;
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      signDisplay: "exceptZero",
    });
    if (shouldCache) percentFormatters.set(fractionDigits, formatter);
  }
  return formatter.format(value / 100);
}
