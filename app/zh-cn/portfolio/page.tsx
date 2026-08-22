import { PortfolioPageContent } from "@/components/portfolio-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投资组合", description: "完整披露的集中投资组合，包括持仓、成本基础、回报与权重。", path: "/portfolio", locale: "zh-cn" });

export default function PortfolioPageZhCn() { return <PortfolioPageContent locale="zh-cn" />; }
