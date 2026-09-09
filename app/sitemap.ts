import type { MetadataRoute } from "next";
import { memos } from "@/data/memos";
import { getLanguageAlternates, getLocalizedPath, locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/about", "/portfolio", "/performance", "/memos", "/contact", "/support", "/disclaimer",
    ...memos.map(memo => `/memos/${memo.slug}`)];
  return routes.flatMap(route => {
    const languages = Object.fromEntries(Object.entries(getLanguageAlternates(route))
      .map(([language, path]) => [language, new URL(path, SITE_URL).href]));
    return locales.map(locale => ({
      url: new URL(getLocalizedPath(route, locale), SITE_URL).href,
      alternates: { languages },
    }));
  });
}
