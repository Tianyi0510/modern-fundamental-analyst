import { AboutPageContent } from "@/components/about-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "关于", description: "Tianyi（David）Li 的背景、投资方法，以及 Modern Fundamental Analyst 背后的理念。", path: "/about", locale: "zh-cn" });

export default function AboutPageZhCn() { return <AboutPageContent locale="zh-cn" />; }
