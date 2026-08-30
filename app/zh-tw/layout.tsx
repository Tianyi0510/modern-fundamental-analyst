import type { Metadata } from "next";
import { SiteDocument } from "@/components/site-document";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import "../globals.css";

const image = `${SITE_URL}/og.png`;
const description = "獨立公開市場股票研究、投資組合、績效紀錄與投資備忘錄。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: "Modern Fundamental Analyst｜繁體中文" },
  description,
  alternates: {
    canonical: "/zh-tw",
    languages: { en: "/", "zh-Hant-TW": "/zh-tw", "zh-Hans-CN": "/zh-cn", "x-default": "/" },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: `${SITE_NAME}｜繁體中文`, description, images: [{ url: image, width: 1728, height: 910, alt: "Ideas compound. Capital follows." }] },
  twitter: { card: "summary_large_image", title: `${SITE_NAME}｜繁體中文`, description, images: [image] },
};

export default function TraditionalChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="zh-Hant-TW">{children}</SiteDocument>;
}
