import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MemoCards } from "@/features/memos/memo-cards";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import type { MemoSummary } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

type MemoIndexProps = {
  memos: readonly MemoSummary[];
  locale: Locale;
  label: string;
};

export function MemoIndex({ memos, locale, label }: MemoIndexProps) {
  return (
    <section className="memo-index shell">
      <MemoCards memos={memos} locale={locale} className="memo-index-featured" />
      <AnimatedDisclosure
        className="memo-disclosure"
        summary={
          <>
            <span>{label}</span>
            <span className="memo-summary-meta">
              <span className="memo-count">{String(memos.length).padStart(2, "0")}</span>
              <ChevronDown aria-hidden="true" size={24} strokeWidth={2} />
            </span>
          </>
        }
      >
        <div className="memo-disclosure-content">
          {memos.map((memo) => (
            <Link href={getLocalizedPath(`/memos/${memo.slug}`, locale)} className="memo-index-row" key={memo.slug}>
              <span>{memo.number}</span>
              <div>
                <small>{memo.category.label}</small>
                <h2>{memo.title}</h2>
                <p>{memo.summary}</p>
              </div>
              <div className="memo-meta">
                <time dateTime={memo.publishedAt}>{formatDate(memo.publishedAt, locale, locale === "en")}</time>
                <span>{memo.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedDisclosure>
    </section>
  );
}
