import { ContactPageContent } from "@/components/contact-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "联系", description: "就投资研究与专业合作联系 Modern Fundamental Analyst。", path: "/contact", locale: "zh-cn" });

export default function ContactPageZhCn() {
  return <ContactPageContent locale="zh-cn" />;
}
