import { SiteDocument } from "@/components/site-document";
import { createRootMetadata } from "@/lib/site-config";
import "../globals.css";

export const metadata = createRootMetadata("zh-cn");

export default function SimplifiedChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument language="zh-CN">{children}</SiteDocument>;
}
