import { SubscriptionPreferencesPage } from "@/components/subscription-preferences-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = { ...createPageMetadata({ title: "邮件偏好", description: "管理 Modern Fundamental Analyst 邮件偏好。", path: "/subscription-preferences", locale: "zh-cn" }), robots: { index: false, follow: false } };

export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionPreferencesPage locale="zh-cn" searchParams={searchParams} />;
}
