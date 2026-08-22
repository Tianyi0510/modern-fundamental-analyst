import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter, notoSansTc } from "@/lib/fonts";

export function SiteDocument({ children, language }: Readonly<{ children: React.ReactNode; language: "en" | "zh-Hant-TW" }>) {
  return (
    <html lang={language} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${notoSansTc.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
