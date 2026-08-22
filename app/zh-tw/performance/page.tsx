import { PerformancePageContent } from "@/components/performance-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "績效", description: "投資組合績效、基準比較與計算方法。", path: "/performance", locale: "zh-tw" });

export default function PerformancePageZhTw() {
  return <PerformancePageContent locale="zh-tw" />;
}
