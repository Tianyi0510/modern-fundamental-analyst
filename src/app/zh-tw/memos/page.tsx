import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "投資備忘錄",
  description: "透過投資備忘錄，了解企業的獲利模式、財報重點，以及影響投資判斷的風險。",
  path: "/memos",
  locale: "zh-tw",
});

export default function MemosPageZhTw() {
  return <MemoListPage locale="zh-tw" />;
}
