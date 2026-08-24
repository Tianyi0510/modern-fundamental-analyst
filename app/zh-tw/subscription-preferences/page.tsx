import { SubscriptionPreferencesPage } from "@/components/subscription-preferences-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = { ...createPageMetadata({ title: "郵件偏好", description: "管理 Modern Fundamental Analyst 郵件偏好。", path: "/subscription-preferences", locale: "zh-tw" }), robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionPreferencesPage locale="zh-tw" searchParams={searchParams} />;
}
