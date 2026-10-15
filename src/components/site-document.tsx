import { TouchPressFeedback } from "./touch-press-feedback";
import { appearance } from "./site-document.styles";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { jost } from "@/lib/fonts";

export function SiteDocument({
  children,
  language,
  fontVariable = "",
}: Readonly<{ children: React.ReactNode; language: "en" | "zh-Hant-TW" | "zh-CN"; fontVariable?: string }>) {
  const skipLabel =
    language === "en" ? "Skip to Main Content" : language === "zh-Hant-TW" ? "跳至主要內容" : "跳至主要内容";

  return (
    <html lang={language} data-scroll-behavior="smooth">
      <body className={`${jost.variable} ${fontVariable}`.trim()}>
        <a className={appearance["skip-link"]} href="#main-content">
          {skipLabel}
        </a>
        {children}
        <TouchPressFeedback />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
