import { AboutPageContent } from "@/components/about-page-content";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "About", description: "Tianyi (David) Li's background, investment approach, and principles behind Modern Fundamental Analyst.", path: "/about" });

export default function AboutPage() { return <AboutPageContent locale="en" />; }
