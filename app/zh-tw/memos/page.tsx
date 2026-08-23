import { MemoListPage } from "@/components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投資備忘錄", description: "關於企業品質、估值、風險與資本配置的長篇研究。", path: "/memos", locale: "zh-tw" });

export default function MemosPageZhTw() {
  return <MemoListPage locale="zh-tw" />;
}
