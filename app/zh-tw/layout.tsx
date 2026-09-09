import { SiteDocument } from "@/components/site-document";
import { createRootMetadata } from "@/lib/site-config";
import "../globals.css";

export const metadata = createRootMetadata("zh-tw");

export default function TraditionalChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="zh-Hant-TW">{children}</SiteDocument>;
}
