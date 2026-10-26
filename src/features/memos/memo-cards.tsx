import { getPlannedMemos, getPlannedMemoCopy } from "./planned-memos";
import { appearance } from "./memo-cards.styles";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Grid } from "@/components/grid";
import type { MemoPreview } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const slotIndexes = [0, 1, 2] as const;

type MemoCardsProps = {
  memos: readonly MemoPreview[];
  locale: Locale;
  placement?: "section" | "featured";
  showPlaceholders?: boolean;
};

export function MemoCards({ memos, locale, placement = "section", showPlaceholders = true }: MemoCardsProps) {
  const planned = getPlannedMemos(locale);
  const placeholder = getPlannedMemoCopy(locale);
  const Heading = placement === "featured" ? "h2" : "h3";

  return (
    <Grid
      className={`${appearance["memo-grid"]} max-[800px]:[&>.memo-card:not(:first-child)]:hidden ${placement === "featured" ? "memo-index-featured mt-0 mb-[var(--space-section-content)]" : "mt-[var(--space-heading-content)]"}`}
    >
      {slotIndexes.map((index) => {
        const memo = memos[index];
        const cardNumber = String(index + 1).padStart(3, "0");

        const plannedMemo = planned[index - memos.length];
        if (!memo)
          return showPlaceholders && plannedMemo ? (
            <article
              className={`${appearance["memo-card"]} ${appearance["memo-card-placeholder"]}`}
              key={plannedMemo.id}
            >
              <Card className={appearance.body}>
                <CardHeader className={appearance.header}>
                  <span>{cardNumber}</span>
                  <span>{placeholder.status}</span>
                </CardHeader>
                <CardContent className={appearance.content}>
                  <Heading className={appearance.title}>{plannedMemo.title}</Heading>
                  <CardDescription className={appearance.description}>{placeholder.summary}</CardDescription>
                </CardContent>
                <CardFooter className={appearance.footer}>{placeholder.availability}</CardFooter>
              </Card>
            </article>
          ) : null;

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
