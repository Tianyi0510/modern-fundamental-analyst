import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "投资备忘录",
  description: "关于微软云计算与 AI 地位、领导层，以及 2024 财政年度财务质量的研究。",
  path: "/memos",
  locale: "zh-cn",
});

export default function MemosPageZhCn() {
  return <MemoListPage locale="zh-cn" />;
}
