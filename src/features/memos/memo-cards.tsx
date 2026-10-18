import { appearance } from "./memo-cards.styles";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Grid } from "@/components/grid";
import type { MemoSummary } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const slotIndexes = [0, 1, 2] as const;

const placeholderCopy = {
  en: {
    status: "Planned",
    title: (number: string) => `Investment memo ${number}`,
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
  const Heading = placement === "featured" ? "h2" : "h3";

  return (
    <Grid
      className={`${appearance["memo-grid"]} ${placement === "featured" ? "memo-index-featured mt-0 mb-[var(--space-section-content)]" : "mt-[var(--space-heading-content)]"}`}
    >
      {slotIndexes.map((index) => {
        const memo = memos[index];
        const cardNumber = String(index + 1).padStart(3, "0");

        if (!memo)
          return (
            <article className={appearance["memo-card"] + " " + appearance["memo-card-placeholder"]} key={cardNumber}>
              <Card className={appearance.body}>
                <CardHeader className={appearance.header}>
                  <span>{cardNumber}</span>
                  <span>{placeholder.status}</span>
                </CardHeader>
                <CardContent className={appearance.content}>
                  <Heading className={appearance.title}>{placeholder.title(cardNumber)}</Heading>
                  <CardDescription className={appearance.description}>{placeholder.summary}</CardDescription>
                </CardContent>
                <CardFooter className={appearance.footer}>{placeholder.availability}</CardFooter>
              </Card>
            </article>
          );

        return (
          <Link
            className={appearance["memo-card"]}
            href={getLocalizedPath(`/memos/${memo.slug}`, locale)}
            key={memo.slug}
          >
            <Card className={appearance.body}>
              <CardHeader className={appearance.header}>
                <span>{memo.number}</span>
                <span>{memo.category.label}</span>
              </CardHeader>
              <CardContent className={appearance.content}>
                <Heading className={appearance.title}>{memo.title}</Heading>
                <CardDescription className={appearance.description}>{memo.summary}</CardDescription>
              </CardContent>
              <CardFooter className={`${appearance.footer} ${appearance["date-text"]}`}>
                <time dateTime={memo.publishedAt}>{formatDate(memo.publishedAt, locale, locale === "en")}</time> ·{" "}
                {memo.readTime}
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </Grid>
  );
}
