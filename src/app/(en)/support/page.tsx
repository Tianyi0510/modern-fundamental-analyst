import { resolveSupportStatus } from "@/lib/stripe-checkout";
import { SupportPageContent } from "@/components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Support Independent Research",
  description:
    "Make a voluntary one-time contribution to support independent public-equity research from Modern Fundamental Analyst.",
  path: "/support",
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
      locale="en"
      status={normalizedStatus}
      attemptId={params.checkout_attempt}
      amount={params.amount}
    />
  );
}
