import type { Locale } from "@/lib/i18n";

const usdFormatters = new Map<number, Intl.NumberFormat>();
const percentFormatters = new Map<number, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const sharesFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const MAX_CACHED_FRACTION_DIGITS = 4;

function shouldCacheFormatter(fractionDigits: number) {
  return Number.isInteger(fractionDigits) && fractionDigits >= 0 && fractionDigits <= MAX_CACHED_FRACTION_DIGITS;
}

function getDateFormatter(locale: Locale, compact: boolean) {
  const dateLocale = locale === "zh-tw" ? "zh-TW" : locale === "zh-cn" ? "zh-CN" : "en-GB";
  const month = compact ? "short" : "long";
  const key = `${dateLocale}:${month}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(dateLocale, {
      day: "numeric",
      month,
      year: "numeric",
      timeZone: "UTC",
    });
    dateFormatters.set(key, formatter);
  }
  return formatter;
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

export function formatDate(value: string, locale: Locale, compact = false) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid ISO date: ${value}`);

  return getDateFormatter(locale, compact).format(date);
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
