import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter, notoSansSc, notoSansTc } from "@/lib/fonts";

export function SiteDocument({ children, language }: Readonly<{ children: React.ReactNode; language: "en" | "zh-Hant-TW" | "zh-CN" }>) {
  return (
    <html lang={language} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${notoSansTc.variable} ${notoSansSc.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
