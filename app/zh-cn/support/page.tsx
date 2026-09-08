import { resolveSupportStatus } from "@/lib/stripe-checkout";
import { SupportPageContent } from "@/components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "支持独立研究",
  description: "通过一次性自愿支持，协助 Modern Fundamental Analyst 持续发布独立公开股票研究。",
  path: "/support",
  locale: "zh-cn",
});

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ status?: string; session_id?: string }> }) {
  const normalizedStatus = await resolveSupportStatus(await searchParams);
  return <SupportPageContent locale="zh-cn" status={normalizedStatus} />;
}
