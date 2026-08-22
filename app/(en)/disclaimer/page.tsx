import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Disclaimer", description: "Important information about the research and performance shown on this site.", path: "/disclaimer" });

export default function DisclaimerPage() {
  return <main><SiteHeader /><section className="legal shell"><p className="eyebrow"><span /> Disclaimer</p><h1>Important information.</h1><div><h2>Not investment advice</h2><p>Nothing on this website constitutes investment, legal, tax, or financial advice. The material is provided for informational and educational purposes only.</p><h2>Performance</h2><p>Past performance does not guarantee future results. Published portfolio and performance figures are based on the disclosed methodology, data, and assumptions; they may contain errors or limitations and should be independently verified.</p><h2>Positions and conflicts</h2><p>I may hold positions in securities discussed on this website. Published views and holdings may change without notice, and relevant positions or potential conflicts will be disclosed where appropriate.</p></div></section><SiteFooter /></main>;
}
