import { DisclaimerPageContent } from "@/components/disclaimer-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "免责声明", description: "关于本网站研究与业绩数据的重要说明。", path: "/disclaimer", locale: "zh-cn" });

export default function DisclaimerPageZhCn() {
  return <DisclaimerPageContent locale="zh-cn" />;
}
