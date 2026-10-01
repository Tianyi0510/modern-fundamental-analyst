import type { SupportSearchParams } from "@/features/support/support-config";
import { SupportPageContent } from "@/app/_components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Support Independent Research",
  description:
    "Make a voluntary one-time contribution to support independent public-equity research from Modern Fundamental Analyst.",
  path: "/support",
});

export default function SupportPage({ searchParams }: { searchParams: Promise<SupportSearchParams> }) {
  return <SupportPageContent locale="en" searchParams={searchParams} />;
}
