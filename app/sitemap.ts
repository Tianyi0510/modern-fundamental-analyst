import type { MetadataRoute } from "next";
import { memos } from "@/data/memos";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const routes = ["", "/about", "/portfolio", "/performance", "/memos", "/contact", "/support", "/disclaimer"];
  const entries = routes.flatMap((route) => {
    const english = `${base}${route}`;
    const traditionalChinese = `${base}/zh-tw${route}`;
    const simplifiedChinese = `${base}/zh-cn${route}`;
    const languages = { en: english, "zh-Hant-TW": traditionalChinese, "zh-Hans-CN": simplifiedChinese, "x-default": english };
    return [
      { url: english, alternates: { languages } },
      { url: traditionalChinese, alternates: { languages } },
      { url: simplifiedChinese, alternates: { languages } },
    ];
  });
  const memoEntries = memos.flatMap((memo) => {
    const english = `${base}/memos/${memo.slug}`;
    const traditionalChinese = `${base}/zh-tw/memos/${memo.slug}`;
    const simplifiedChinese = `${base}/zh-cn/memos/${memo.slug}`;
    const languages = { en: english, "zh-Hant-TW": traditionalChinese, "zh-Hans-CN": simplifiedChinese, "x-default": english };
    return [
      { url: english, alternates: { languages } },
      { url: traditionalChinese, alternates: { languages } },
      { url: simplifiedChinese, alternates: { languages } },
    ];
  });
  return [...entries, ...memoEntries];
}
