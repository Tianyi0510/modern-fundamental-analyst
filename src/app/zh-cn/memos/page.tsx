import { MemoListPage } from "@/app/_components/memo-list-page";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "投资备忘录",
  description: "通过投资备忘录，了解企业的盈利模式、财报重点，以及影响投资判断的风险。",
  path: "/memos",
  locale: "zh-cn",
});

export default function MemosPageZhCn() {
  return <MemoListPage locale="zh-cn" />;
}
