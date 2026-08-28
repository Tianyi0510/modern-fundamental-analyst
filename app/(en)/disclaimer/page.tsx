import { DisclaimerPageContent } from "@/components/disclaimer-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Disclaimer", description: "Please read these terms carefully before relying on any research, financial information, valuation, or performance data published on this website.", path: "/disclaimer" });

export default function DisclaimerPage() {
  return <DisclaimerPageContent locale="en" />;
}
