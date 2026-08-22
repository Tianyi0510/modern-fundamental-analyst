import type { MetadataRoute } from "next";
import { memos } from "@/data/site";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const routes = ["", "/about", "/portfolio", "/performance", "/memos", "/contact", "/disclaimer"];
  const entries = routes.flatMap((route) => {
    const english = `${base}${route}`;
    const chinese = `${base}/zh-tw${route}`;
    const languages = { en: english, "zh-Hant-TW": chinese, "x-default": english };
    return [
      { url: english, alternates: { languages } },
      { url: chinese, alternates: { languages } },
    ];
  });
  const memoEntries = memos.flatMap((memo) => {
    const english = `${base}/memos/${memo.slug}`;
    const chinese = `${base}/zh-tw/memos/${memo.slug}`;
    const languages = { en: english, "zh-Hant-TW": chinese, "x-default": english };
    return [
      { url: english, alternates: { languages } },
      { url: chinese, alternates: { languages } },
    ];
  });
  return [...entries, ...memoEntries];
}
