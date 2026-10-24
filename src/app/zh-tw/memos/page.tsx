import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "投資備忘錄",
  description: "關於微軟雲端與 AI 地位、領導層，以及 2024 財政年度財務品質的研究。",
  path: "/memos",
  locale: "zh-tw",
});

export default function MemosPageZhTw() {
  return <MemoListPage locale="zh-tw" />;
}
