import { PerformancePageContent } from "@/components/performance-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "业绩", description: "每月披露投资组合回报、XIRR、基准与计算方法。", path: "/performance", locale: "zh-cn" });

export default function PerformancePageZhCn() { return <PerformancePageContent locale="zh-cn" />; }
