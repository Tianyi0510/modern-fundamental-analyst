import type { SupportSearchParams } from "@/features/support/support-config";
import { SupportPageContent } from "@/app/_components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "支持独立研究",
  description: "通过一次性自愿支持，协助 Modern Fundamental Analyst 持续发布独立公开股票研究。",
  path: "/support",
  locale: "zh-cn",
});

export default function SupportPage({ searchParams }: { searchParams: Promise<SupportSearchParams> }) {
  return <SupportPageContent locale="zh-cn" searchParams={searchParams} />;
}
