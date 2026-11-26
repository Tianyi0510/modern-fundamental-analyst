export function holdingPath(symbol: string): `/portfolio/${string}` {
  return `/portfolio/${encodeURIComponent(symbol.toLowerCase())}`;
}
