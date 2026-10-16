import { createRef, type ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type Link from "next/link";
import { IntentLink } from "./intent-link";

vi.mock("next/link", () => ({
  default: ({ prefetch, children, href, ...props }: ComponentProps<typeof Link>) => (
    <a data-prefetch={String(prefetch)} href={typeof href === "string" ? href : (href.pathname ?? "")} {...props}>
      {children}
    </a>
  ),
}));

describe("navigation intent", () => {
  it.each(["mouseEnter", "focus", "pointerDown"] as const)(
    "enables prefetch on %s and retains native link props and refs",
    (event) => {
      const ref = createRef<HTMLAnchorElement>();
      const handler = vi.fn();
      const events = { mouseEnter: "onMouseEnter", focus: "onFocus", pointerDown: "onPointerDown" } as const;
      render(
        <IntentLink href="/zh-tw/portfolio" hrefLang="zh-Hant" ref={ref} {...{ [events[event]]: handler }}>
          Portfolio
        </IntentLink>,
      );
      const link = screen.getByRole("link", { name: "Portfolio" });
      expect(link).toHaveAttribute("data-prefetch", "false");
      fireEvent[event](link);
      expect(handler).toHaveBeenCalledOnce();
      expect(link).toHaveAttribute("data-prefetch", "null");
      expect(link).toHaveAttribute("href", "/zh-tw/portfolio");
      expect(link).toHaveAttribute("hreflang", "zh-Hant");
      expect(ref.current).toBe(link);
    },
  );

  it("retains an explicit opt-out after interaction", () => {
    render(
      <IntentLink href="/support" prefetch={false}>
        Support
      </IntentLink>,
    );
    const link = screen.getByRole("link", { name: "Support" });
    fireEvent.focus(link);
    expect(link).toHaveAttribute("data-prefetch", "false");
  });

  it("respects a caller that prevents pointer handling", () => {
    render(
      <IntentLink href="/about" onPointerDown={(event) => event.preventDefault()}>
        About
      </IntentLink>,
    );
    const link = screen.getByRole("link", { name: "About" });
    fireEvent.pointerDown(link);
    expect(link).toHaveAttribute("data-prefetch", "false");
  });
});
