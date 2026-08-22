import type { Metadata } from "next";
import { SiteDocument } from "@/components/site-document";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import "../globals.css";

const image = `${SITE_URL}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/", languages: { en: "/", "zh-Hant-TW": "/zh-tw", "zh-Hans-CN": "/zh-cn", "x-default": "/" } },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION, images: [{ url: image, width: 1728, height: 910, alt: "Ideas compound. Capital follows." }] },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION, images: [image] },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="en">{children}</SiteDocument>;
}
