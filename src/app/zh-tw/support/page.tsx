import { resolveSupportStatus } from "@/lib/stripe-checkout";
import { SupportPageContent } from "@/components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "支持獨立研究",
  description: "透過一次性自願支持，協助 Modern Fundamental Analyst 持續發布獨立公開股票研究。",
  path: "/support",
  locale: "zh-tw",
});

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; session_id?: string; checkout_attempt?: string; amount?: string }>;
}) {
  const params = await searchParams;
  const normalizedStatus = await resolveSupportStatus(params);
  return (
    <SupportPageContent
      locale="zh-tw"
      status={normalizedStatus}
      attemptId={params.checkout_attempt}
      amount={params.amount}
    />
  );
}
