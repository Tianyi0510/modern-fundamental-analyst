import type { Metadata } from "next";
import { SiteDocument } from "@/components/site-document";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { siteViewport } from "@/lib/site-viewport";
import "../globals.css";

const image = `${SITE_URL}/og.png`;
export const viewport = siteViewport;
const description = "独立公开市场股票研究、投资组合、业绩记录与投资备忘录。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: "Modern Fundamental Analyst｜简体中文" },
  description,
  alternates: {
    canonical: "/zh-cn",
    languages: { en: "/", "zh-Hant-TW": "/zh-tw", "zh-Hans-CN": "/zh-cn", "x-default": "/" },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: `${SITE_NAME}｜简体中文`, description, images: [{ url: image, width: 1728, height: 910, alt: "Ideas compound. Capital follows." }] },
  twitter: { card: "summary_large_image", title: `${SITE_NAME}｜简体中文`, description, images: [image] },
};

export default function SimplifiedChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="zh-CN">{children}</SiteDocument>;
}
