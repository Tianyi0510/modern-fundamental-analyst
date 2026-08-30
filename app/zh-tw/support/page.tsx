import { SupportPageContent } from "@/components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "支持獨立研究",
  description: "透過一次性自願支持，協助 Modern Fundamental Analyst 持續發布獨立公開股票研究。",
  path: "/support",
  locale: "zh-tw",
});

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const normalizedStatus = status === "success" || status === "cancelled" || status === "error" ? status : undefined;
  return <SupportPageContent locale="zh-tw" status={normalizedStatus} />;
}
