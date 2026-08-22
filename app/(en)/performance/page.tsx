import { PerformancePageContent } from "@/components/performance-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Performance", description: "Portfolio performance, benchmark comparison, and methodology.", path: "/performance" });

export default function PerformancePage() {
  return <PerformancePageContent locale="en" />;
}
