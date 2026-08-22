import { PortfolioPageContent } from "@/components/portfolio-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Portfolio", description: "Current portfolio allocation and position-level investment rationale.", path: "/portfolio" });

export default function PortfolioPage() {
  return <PortfolioPageContent locale="en" />;
}
