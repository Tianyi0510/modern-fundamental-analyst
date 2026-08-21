import type { MetadataRoute } from "next";
import { memos } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/about", "/portfolio", "/performance", "/memos", "/contact", "/disclaimer"];
  const entries = routes.flatMap((route) => {
    const english = `${base}${route}`;
    const chinese = `${base}/zh-tw${route}`;
    const languages = { en: english, "zh-Hant-TW": chinese };
    return [
      { url: english, alternates: { languages } },
      { url: chinese, alternates: { languages } },
    ];
  });
  const memoEntries = memos.flatMap((memo) => {
    const english = `${base}/memos/${memo.slug}`;
    const chinese = `${base}/zh-tw/memos/${memo.slug}`;
    const languages = { en: english, "zh-Hant-TW": chinese };
    return [
      { url: english, alternates: { languages } },
      { url: chinese, alternates: { languages } },
    ];
  });
  return [...entries, ...memoEntries];
}
