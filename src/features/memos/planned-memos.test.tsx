import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoCards } from "./memo-cards";
import { getMemos, getMemoStaticParams } from "./memos";
import { getPlannedMemos } from "./planned-memos";

it.each(["en", "zh-tw", "zh-cn"] as const)(
  "shows two named planned articles without publishing them (%s)",
  (locale) => {
    const published = getMemos(locale);
    const planned = getPlannedMemos(locale);
    expect(planned).toHaveLength(2);
    render(<MemoCards memos={published} locale={locale} placement="featured" />);
    for (const article of planned) {
      expect(screen.getByRole("heading", { name: article.title })).toBeVisible();
      expect(
        screen.queryByRole("link", { name: new RegExp(article.title.replace(/[?]/g, "\\?")) }),
      ).not.toBeInTheDocument();
    }
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(getMemoStaticParams()).toEqual([{ slug: "microsoft-stock-analysis-fiscal-year-2024" }]);
    expect(published).toHaveLength(1);
  },
);
