import type { SupportSearchParams } from "@/features/support/support-config";
import { SupportPageContent } from "@/app/_components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "支持獨立研究",
  description: "透過一次性自願支持，協助 Modern Fundamental Analyst 持續發布獨立公開股票研究。",
  path: "/support",
  locale: "zh-tw",
});

export default function SupportPage({ searchParams }: { searchParams: Promise<SupportSearchParams> }) {
  return <SupportPageContent locale="zh-tw" searchParams={searchParams} />;
}
