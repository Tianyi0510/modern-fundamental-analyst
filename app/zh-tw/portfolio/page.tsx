import { PortfolioPageContent } from "@/components/portfolio-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投資組合", description: "目前投資組合配置與各部位的投資角色。", path: "/portfolio", locale: "zh-tw" });

export default function PortfolioPageZhTw() {
  return <PortfolioPageContent locale="zh-tw" />;
}
