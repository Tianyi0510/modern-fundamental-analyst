export type Locale = "en" | "zh-tw" | "zh-cn";

export const locales: ReadonlyArray<Locale> = ["en", "zh-tw", "zh-cn"];

export const localeConfig = {
  en: { prefix: "", hrefLang: "en", htmlLang: "en", label: "English" },
  "zh-tw": { prefix: "/zh-tw", hrefLang: "zh-Hant-TW", htmlLang: "zh-Hant-TW", label: "繁體中文" },
  "zh-cn": { prefix: "/zh-cn", hrefLang: "zh-Hans-CN", htmlLang: "zh-CN", label: "简体中文" },
} as const;

export function resolveLocale(value: unknown, fallback: Locale = "en"): Locale {
  return typeof value === "string" && locales.includes(value as Locale) ? value as Locale : fallback;
}

export function getLocalizedPath(pathname: string, locale: Locale) {
  const path = pathname.replace(/^\/zh-(?:tw|cn)(?=\/|$)/, "") || "/";
  const prefix = localeConfig[locale].prefix;
  return path === "/" ? prefix || "/" : `${prefix}${path}`;
}
