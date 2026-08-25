import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { jost, notoSansSc, notoSansTc } from "@/lib/fonts";

export function SiteDocument({ children, language }: Readonly<{ children: React.ReactNode; language: "en" | "zh-Hant-TW" | "zh-CN" }>) {
  const skipLabel = language === "en" ? "Skip to main content" : language === "zh-Hant-TW" ? "跳至主要內容" : "跳至主要内容";

  return (
    <html lang={language} data-scroll-behavior="smooth">
      <body className={`${jost.variable} ${notoSansTc.variable} ${notoSansSc.variable}`}>
        <a className="skip-link" href="#main-content">{skipLabel}</a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
