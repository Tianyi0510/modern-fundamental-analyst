import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const description = "An independent public-equity portfolio, performance record, and investment memo archive.";
  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: { default: "Modern Fundamental Analyst", template: "%s | Modern Fundamental Analyst" },
    description,
    alternates: { canonical: "/", languages: { en: "/", "zh-Hant-TW": "/zh-tw" } },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "Modern Fundamental Analyst", description, images: [{ url: image, width: 1728, height: 910, alt: "Ideas compound. Capital follows." }] },
    twitter: { card: "summary_large_image", title: "Modern Fundamental Analyst", description, images: [image] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const language = headerList.get("x-site-language") === "zh-Hant-TW" ? "zh-Hant-TW" : "en";

  return (
    <html lang={language} data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${notoSansTc.variable}`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
