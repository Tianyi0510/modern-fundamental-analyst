import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Disclaimer", description: "Important information about the research and performance shown on this site.", path: "/disclaimer" });

export default function DisclaimerPage() {
  return <main><SiteHeader counterpartPath="/zh-tw/disclaimer" /><section className="legal shell"><p className="eyebrow"><span /> Disclaimer</p><h1>Important information.</h1><div><h2>Not investment advice</h2><p>Nothing on this website constitutes investment, legal, tax, or financial advice. The material is provided for informational and educational purposes only.</p><h2>Performance</h2><p>Past performance does not guarantee future results. Initial figures shown in this prototype are illustrative and must not be treated as an actual performance record.</p><h2>Positions and conflicts</h2><p>Published views may change without notice. Relevant holdings and potential conflicts will be disclosed with final research.</p></div></section><SiteFooter /></main>;
}
