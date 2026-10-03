import { SubscriptionConfirmationPage } from "@/app/_components/subscription-confirmation-page";
import { createPageMetadata } from "@/lib/site-config";
import { confirmationCopy } from "@/features/subscriptions/confirmation-copy";

export const metadata = {
  ...createPageMetadata({
    title: confirmationCopy["en"].subject,
    description: confirmationCopy["en"].body,
    path: "/subscription-confirmation",
    locale: "en",
  }),
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionConfirmationPage locale="en" searchParams={searchParams} />;
}
