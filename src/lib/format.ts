import type { Locale } from "@/lib/i18n";

const usdFormatters = new Map<number, Intl.NumberFormat>();
const percentFormatters = new Map<number, Intl.NumberFormat>();
const sharesFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const MAX_CACHED_FRACTION_DIGITS = 4;

function shouldCacheFormatter(fractionDigits: number) {
  return Number.isInteger(fractionDigits) && fractionDigits >= 0 && fractionDigits <= MAX_CACHED_FRACTION_DIGITS;
}

// Fixed display names keep SSR and browser text identical across ICU/CLDR versions.
const englishMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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

export function formatDate(value: string, locale: Locale, compact = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError(`Invalid ISO date: ${value}`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError(`Invalid ISO date: ${value}`);
  }

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  if (locale !== "en") return `${year}年${month + 1}月${day}日`;
  const monthName = englishMonths[month]!;
  return `${day} ${compact ? monthName.slice(0, 3) : monthName} ${year}`;
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
