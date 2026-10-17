import { SubscriptionPreferencesPage } from "@/app/_components/subscription-preferences-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = {
  ...createPageMetadata({
    title: "邮件偏好",
    description: "管理 Modern Fundamental Analyst 邮件偏好。",
    path: "/subscription-preferences",
    indexable: false,
    locale: "zh-cn",
  }),
};

export default function Page({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  return <SubscriptionPreferencesPage locale="zh-cn" searchParams={searchParams} />;
}
