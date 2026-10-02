import { appearance } from "./memo-index.styles";
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
    <section className={appearance["memo-index"] + " " + appearance["shell"]}>
      <MemoCards memos={memos} locale={locale} placement="featured" />
      <AnimatedDisclosure
        className={appearance["memo-disclosure"]}
        summary={
          <>
            <span>{label}</span>
            <span className={appearance["memo-summary-meta"]}>
              <span className={appearance["memo-count"]}>{String(memos.length).padStart(2, "0")}</span>
              <ChevronDown aria-hidden="true" size={24} strokeWidth={2} />
            </span>
          </>
        }
      >
        <div className={appearance["memo-disclosure-content"]}>
          {memos.map((memo) => (
            <Link
              href={getLocalizedPath(`/memos/${memo.slug}`, locale)}
              className={appearance["memo-index-row"]}
              key={memo.slug}
            >
              <span>{memo.number}</span>
              <div>
                <small>{memo.category.label}</small>
                <h2>{memo.title}</h2>
                <p>{memo.summary}</p>
              </div>
              <div className={appearance["memo-meta"]}>
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
