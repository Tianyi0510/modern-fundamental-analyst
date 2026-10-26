import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MemoIndex } from "./memo-index";
import { getMemoCategories } from "./memo-categories";
import { getMemos } from "./memos";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

it.each(getMemoCategories("en"))("shows published $label articles from a category URL", ({ id, label }) => {
  window.history.replaceState(null, "", `/memos?category=${id}`);
  const source = getMemos("en")[0]!;
  const memos = getMemoCategories("en").map((category, index) => ({
    ...source,
    slug: `example-${category.id}`,
    number: String(index + 1).padStart(3, "0"),
    title: `${category.label} example`,
    category,
  }));
  render(<MemoIndex memos={memos} locale="en" label="View all investment memos" />);
  expect(screen.getByRole("combobox", { name: "Article category" })).toHaveValue(id);
  expect(screen.getByRole("heading", { name: `${label} example` })).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("1 published article");
  for (const other of memos.filter((memo) => memo.category.id !== id)) {
    expect(screen.queryByRole("heading", { name: other.title })).not.toBeInTheDocument();
  }
  expect(screen.queryByText("Planned")).not.toBeInTheDocument();
});
