import { MemoListPage } from "@/components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投资备忘录", description: "关于企业质量、估值、风险与资本配置的长篇研究。", path: "/memos", locale: "zh-cn" });

export default function MemosPageZhCn() {
  return <MemoListPage locale="zh-cn" />;
}
