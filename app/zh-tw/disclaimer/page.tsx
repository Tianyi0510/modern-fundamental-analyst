import { DisclaimerPageContent } from "@/components/disclaimer-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "免責聲明", description: "關於本網站研究與績效資料的重要說明。", path: "/disclaimer", locale: "zh-tw" });

export default function DisclaimerPageZhTw() {
  return <DisclaimerPageContent locale="zh-tw" />;
}
