import { ContactPageContent } from "@/components/contact-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "聯絡", description: "就投資研究與專業合作聯絡 Modern Fundamental Analyst。", path: "/contact", locale: "zh-tw" });

export default function ContactPageZhTw() {
  return <ContactPageContent locale="zh-tw" />;
}
