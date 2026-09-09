import { SiteDocument } from "@/components/site-document";
import { createRootMetadata } from "@/lib/site-config";
import "../globals.css";

export const metadata = createRootMetadata("en");

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="en">{children}</SiteDocument>;
}
