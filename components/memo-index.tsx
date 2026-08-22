import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/format";

type Memo = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  tag: string;
};

type MemoIndexProps = {
  memos: readonly Memo[];
  locale: "en" | "zh-tw" | "zh-cn";
  label: string;
  basePath: string;
};

export function MemoIndex({ memos, locale, label, basePath }: MemoIndexProps) {
  return (
    <section className="memo-index shell">
      <details className="memo-disclosure">
        <summary>
          <span>{label}</span>
          <span className="memo-count">{String(memos.length).padStart(2, "0")}</span>
          <ChevronDown aria-hidden="true" size={24} strokeWidth={2} />
        </summary>
        <div className="memo-disclosure-content">
          {memos.map((memo) => (
            <Link href={`${basePath}/${memo.slug}`} className="memo-index-row" key={memo.slug}>
              <span>{memo.number}</span>
              <div><small>{memo.tag}</small><h2>{memo.title}</h2><p>{memo.summary}</p></div>
              <div className="memo-meta"><span>{formatDate(memo.publishedAt, locale, locale === "en")}</span><span>{memo.readTime}</span><b className="arrow-icon" aria-hidden="true">↗︎</b></div>
            </Link>
          ))}
        </div>
      </details>
    </section>
  );
}
