import { DisclaimerPageContent } from "@/app/_components/disclaimer-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Disclaimer",
  description:
    "Read these terms before using this website’s research, financial information, valuations or performance data.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return <DisclaimerPageContent locale="en" />;
}
