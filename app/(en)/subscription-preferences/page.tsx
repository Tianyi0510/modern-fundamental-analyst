import { SubscriptionPreferencesPage } from "@/components/subscription-preferences-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = { ...createPageMetadata({ title: "Email Preferences", description: "Manage your Modern Fundamental Analyst email preferences.", path: "/subscription-preferences" }), robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionPreferencesPage locale="en" searchParams={searchParams} />;
}
