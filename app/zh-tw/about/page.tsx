import { AboutPageContent } from "@/components/about-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "關於", description: "Tianyi（David）Li 的背景、投資方法，以及 Modern Fundamental Analyst 背後的理念。", path: "/about", locale: "zh-tw" });

export default function AboutPageZhTw() { return <AboutPageContent locale="zh-tw" />; }
