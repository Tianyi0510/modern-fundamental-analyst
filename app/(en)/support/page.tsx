import { SupportPageContent } from "@/components/support-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Support Independent Research",
  description: "Make a voluntary one-time contribution to support independent public-equity research from Modern Fundamental Analyst.",
  path: "/support",
});

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const normalizedStatus = status === "success" || status === "cancelled" || status === "error" ? status : undefined;
  return <SupportPageContent locale="en" status={normalizedStatus} />;
}
