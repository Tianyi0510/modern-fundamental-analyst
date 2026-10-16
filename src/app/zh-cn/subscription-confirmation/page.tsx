import { SubscriptionConfirmationPage } from "@/app/_components/subscription-confirmation-page";
import { createPageMetadata } from "@/lib/site-config";
import { confirmationCopy } from "@/features/subscriptions/confirmation-copy";

export const metadata = {
  ...createPageMetadata({
    title: confirmationCopy["zh-cn"].subject,
    description: confirmationCopy["zh-cn"].body,
    path: "/subscription-confirmation",
    indexable: false,
    locale: "zh-cn",
  }),
  referrer: "no-referrer" as const,
};
export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionConfirmationPage locale="zh-cn" searchParams={searchParams} />;
}
