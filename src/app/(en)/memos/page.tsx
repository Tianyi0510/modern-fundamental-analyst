import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Investment memos",
  description:
    "Investment research on business models, financial statements, and the risks behind each investment thesis.",
  path: "/memos",
});

export default function MemosPage() {
  return <MemoListPage locale="en" />;
}
