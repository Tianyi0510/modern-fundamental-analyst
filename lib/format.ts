const usdFormatters = new Map<number, Intl.NumberFormat>();

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

export const formatShares = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
