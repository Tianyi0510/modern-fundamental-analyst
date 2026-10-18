import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MemoShare } from "./memo-share";

it("copies the article URL without query parameters and announces success", async () => {
  const user = userEvent.setup();
  const clipboard = vi.spyOn(navigator.clipboard, "writeText");
  render(<MemoShare locale="en" />);
  await user.click(screen.getByRole("button", { name: "Copy Article Link" }));
  expect(clipboard).toHaveBeenCalledWith(`${window.location.origin}${window.location.pathname}`);
  expect(await screen.findByText("Article link copied.")).toBeVisible();
});

it("explains clipboard failure and allows another attempt", async () => {
  const user = userEvent.setup();
  const clipboard = vi
    .spyOn(navigator.clipboard, "writeText")
    .mockRejectedValueOnce(new Error("Clipboard unavailable"));
  render(<MemoShare locale="zh-tw" />);
  const button = screen.getByRole("button", { name: "複製文章連結" });
  await user.click(button);
  expect(await screen.findByText("無法複製連結，請從網址列複製。")).toBeVisible();
  expect(button).toBeEnabled();
  await user.click(button);
  expect(clipboard).toHaveBeenCalledTimes(2);
  expect(await screen.findByText("已複製文章連結。")).toBeVisible();
});
