import { appearance } from "./memo-cards.styles";
import Link from "next/link";
import type { MemoSummary } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const slotIndexes = [0, 1, 2] as const;

const placeholderCopy = {
  en: {
    status: "Planned",
    title: (number: string) => `Investment Memo ${number}`,
    summary: "Research is in progress. This space is reserved for a future investment thesis.",
    availability: "Coming soon",
  },
  "zh-tw": {
    status: "規劃中",
    title: (number: string) => `投資備忘錄 ${number}`,
    summary: "研究正在進行中，此位置將刊登未來的投資論點。",
    availability: "即將推出",
  },
  "zh-cn": {
    status: "规划中",
    title: (number: string) => `投资备忘录 ${number}`,
    summary: "研究正在进行中，此位置将刊登未来的投资论点。",
    availability: "即将推出",
  },
} as const;

type MemoCardsProps = {
  memos: readonly MemoSummary[];
  locale: Locale;
  placement?: "section" | "featured";
};

export function MemoCards({ memos, locale, placement = "section" }: MemoCardsProps) {
  const placeholder = placeholderCopy[locale];

  return (
    <div
      className={`${appearance["memo-grid"]} ${placement === "featured" ? "memo-index-featured mt-0 mb-[var(--space-section)]" : "mt-[var(--space-heading-content)]"}`}
    >
      {slotIndexes.map((index) => {
        const memo = memos[index];
        const cardNumber = String(index + 1).padStart(3, "0");

        if (!memo)
          return (
            <article className={appearance["memo-card"] + " " + appearance["memo-card-placeholder"]} key={cardNumber}>
              <div>
                <span>{cardNumber}</span>
                <span>{placeholder.status}</span>
              </div>
              <h3>{placeholder.title(cardNumber)}</h3>
              <p>{placeholder.summary}</p>
              <small>{placeholder.availability}</small>
            </article>
          );

        return (
          <Link
            className={appearance["memo-card"]}
            href={getLocalizedPath(`/memos/${memo.slug}`, locale)}
            key={memo.slug}
          >
            <div>
              <span>{memo.number}</span>
              <span>{memo.category.label}</span>
            </div>
            <h3>{memo.title}</h3>
            <p>{memo.summary}</p>
            <small className={appearance["date-text"]}>
              <time dateTime={memo.publishedAt}>{formatDate(memo.publishedAt, locale, locale === "en")}</time> ·{" "}
              {memo.readTime}
            </small>
          </Link>
        );
      })}
    </div>
  );
}
