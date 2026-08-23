import { DisclaimerPageContent } from "@/components/disclaimer-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Disclaimer", description: "Important information about the research and performance shown on this site.", path: "/disclaimer" });

export default function DisclaimerPage() {
  return <DisclaimerPageContent locale="en" />;
}
