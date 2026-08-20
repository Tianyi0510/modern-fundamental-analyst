import type { MetadataRoute } from "next";
import { memos } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/about", "/portfolio", "/performance", "/memos", "/contact", "/disclaimer"];
  return [...routes.map((route) => ({ url: `${base}${route}` })), ...memos.map((memo) => ({ url: `${base}/memos/${memo.slug}` }))];
}
