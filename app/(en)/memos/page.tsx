import { MemoListPage } from "@/components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Investment Memos", description: "Long-form notes on business quality, valuation, risk, and capital allocation.", path: "/memos" });

export default function MemosPage() {
  return <MemoListPage locale="en" />;
}
