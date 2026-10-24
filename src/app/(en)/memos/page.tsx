import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Investment memos",
  description: "Research on Microsoft’s cloud and AI position, leadership, and fiscal 2024 financial quality.",
  path: "/memos",
});

export default function MemosPage() {
  return <MemoListPage locale="en" />;
}
