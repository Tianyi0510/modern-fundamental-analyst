"use client";

import { Suspense, useId } from "react";
import { useSearchParams } from "next/navigation";
import { getMemoCategories, readMemoCategory } from "./memo-categories";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { getPlannedMemos, getPlannedMemoCopy } from "./planned-memos";
import { appearance } from "./memo-index.styles";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MemoCards } from "@/features/memos/memo-cards";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import type { MemoPreview } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const filterCopy = {
  en: {
    category: "Article category",
    all: "All categories",
    empty: "No published articles in this category yet.",
    count: (count: number) => `${count} published ${count === 1 ? "article" : "articles"}`,
  },
  "zh-tw": {
    category: "文章分類",
    all: "所有分類",
    empty: "此分類尚未有已發布文章。",
    count: (count: number) => `${count} 篇已發布文章`,
  },
  "zh-cn": {
    category: "文章分类",
    all: "所有分类",
    empty: "此分类尚无已发布文章。",
    count: (count: number) => `${count} 篇已发布文章`,
  },
} as const;

type MemoIndexProps = {
  memos: readonly MemoPreview[];
  locale: Locale;
  label: string;
};

export function MemoIndex(props: MemoIndexProps) {
  return (
    <Suspense fallback={<MemoIndexView {...props} category="all" />}>
      <UrlMemoIndex {...props} />
    </Suspense>
  );
}

function UrlMemoIndex(props: MemoIndexProps) {
  const params = useSearchParams();
  const category = readMemoCategory(params.get("category"));
  const setCategory = (value: string) => {
    const url = new URL(window.location.href);
    const next = readMemoCategory(value);
    if (next === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", next);
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  };
  return <MemoIndexView {...props} category={category} setCategory={setCategory} />;
}

function MemoIndexView({
  memos,
  locale,
  label,
  category,
  setCategory,
}: MemoIndexProps & {
  category: ReturnType<typeof readMemoCategory>;
  setCategory?: (value: string) => void;
}) {
  const id = useId();
  const text = filterCopy[locale];
  const categories = getMemoCategories(locale);
  const planned = category === "all" ? getPlannedMemos(locale) : [];
  const plannedCopy = getPlannedMemoCopy(locale);
  const visibleMemos = category === "all" ? memos : memos.filter((memo) => memo.category.id === category);

  return (
    <section className={appearance["memo-index"] + " " + appearance["shell"]}>
      <div className="mb-[var(--space-section-content)] grid gap-4">
        <Field className="w-full max-w-md">
          <FieldLabel htmlFor={id}>{text.category}</FieldLabel>
          <NativeSelect
            id={id}
            value={category}
            disabled={!setCategory}
            onChange={(event) => setCategory?.(event.target.value)}
          >
            <option value="all">{text.all}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <p role="status" className="m-0 text-small-body">
          {text.count(visibleMemos.length)}
        </p>
      </div>
      {visibleMemos.length === 0 ? (
        <Empty>
          <EmptyDescription>{text.empty}</EmptyDescription>
        </Empty>
      ) : (
        <>
          <MemoCards memos={visibleMemos} locale={locale} placement="featured" showPlaceholders={category === "all"} />
          <AnimatedDisclosure
            className={appearance["memo-disclosure"]}
            summary={
              <>
                <span>{label}</span>
                <span className={appearance["memo-summary-meta"]}>
                  <span className={appearance["memo-count"]}>{String(visibleMemos.length).padStart(2, "0")}</span>
                  <ChevronDown aria-hidden="true" size={24} strokeWidth={2} />
                </span>
              </>
            }
          >
            <div className={appearance["memo-disclosure-content"]}>
              {visibleMemos.map((memo) => (
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
              {planned.map((memo, index) => (
                <div className={appearance["memo-planned-row"]} key={memo.id}>
                  <span>{String(memos.length + index + 1).padStart(3, "0")}</span>
                  <div>
                    <small>{plannedCopy.status}</small>
                    <h2>{memo.title}</h2>
                    <p>{plannedCopy.summary}</p>
                    <p>{plannedCopy.availability}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedDisclosure>
        </>
      )}
    </section>
  );
}
