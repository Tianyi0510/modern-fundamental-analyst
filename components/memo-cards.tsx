import Link from "next/link";
import type { MemoSummary } from "@/data/memos";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

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
  basePath: string;
  className?: string;
};

export function MemoCards({ memos, locale, basePath, className = "" }: MemoCardsProps) {
  const placeholder = placeholderCopy[locale];

  return <div className={`memo-grid${className ? ` ${className}` : ""}`}>
    {slotIndexes.map((index) => {
      const memo = memos[index];
      const cardNumber = String(index + 1).padStart(3, "0");

      if (!memo) return <article className={`memo-card memo-card-placeholder memo-card-${index + 1}`} key={cardNumber}>
        <div><span>{cardNumber}</span><span>{placeholder.status}</span></div>
        <h3>{placeholder.title(cardNumber)}</h3>
        <p>{placeholder.summary}</p>
        <small>{placeholder.availability}</small>
      </article>;

      return <Link className={`memo-card memo-card-${index + 1}`} href={`${basePath}/${memo.slug}`} key={memo.slug}>
        <div><span>{memo.number}</span><span>{memo.tag}</span></div>
        <h3>{memo.title}</h3>
        <p>{memo.summary}</p>
        <small className="date-text">{formatDate(memo.publishedAt, locale, locale === "en")} · {memo.readTime}</small>
      </Link>;
    })}
  </div>;
}
