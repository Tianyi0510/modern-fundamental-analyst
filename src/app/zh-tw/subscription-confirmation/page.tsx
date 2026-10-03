import { SubscriptionConfirmationPage } from "@/app/_components/subscription-confirmation-page";
import { createPageMetadata } from "@/lib/site-config";
import { confirmationCopy } from "@/features/subscriptions/confirmation-copy";

export const metadata = {
  ...createPageMetadata({
    title: confirmationCopy["zh-tw"].subject,
    description: confirmationCopy["zh-tw"].body,
    path: "/subscription-confirmation",
    locale: "zh-tw",
  }),
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionConfirmationPage locale="zh-tw" searchParams={searchParams} />;
}
