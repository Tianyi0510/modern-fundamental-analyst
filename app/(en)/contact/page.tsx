import { ContactPageContent } from "@/components/contact-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Contact", description: "Contact Modern Fundamental Analyst about investment research and professional conversations.", path: "/contact" });

export default function ContactPage() {
  return <ContactPageContent locale="en" />;
}
