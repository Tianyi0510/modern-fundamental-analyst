import { createRef } from "react";
import { ChartPie } from "lucide-react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./sidebar";

it("keeps navigation as a list of real links with one current page", async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn((event: React.MouseEvent) => event.preventDefault());
  render(
    <nav aria-label="Primary">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <a href="/portfolio">
                <ChartPie aria-hidden="true" />
                <span>Portfolio</span>
              </a>
            }
            isActive
            aria-current="page"
          />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={
              <a href="/about" hrefLang="en">
                About
              </a>
            }
            onClick={onNavigate}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </nav>,
  );
  const list = within(screen.getByRole("navigation", { name: "Primary" })).getByRole("list");
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(within(list).queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Portfolio", current: "page" })).toHaveAttribute("data-active", "true");
  const about = screen.getByRole("link", { name: "About" });
  expect(about).toHaveAttribute("href", "/about");
  expect(about).toHaveAttribute("hreflang", "en");
  await user.tab();
  expect(screen.getByRole("link", { name: "Portfolio" })).toHaveFocus();
  await user.tab();
  expect(about).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(onNavigate).toHaveBeenCalledOnce();
});

it("merges the rendered link's ref, accessible name and handlers without adding a button", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLAnchorElement>();
  const onLinkClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
  const onItemClick = vi.fn();
  render(
    <SidebarMenuButton
      render={<a ref={ref} href="/portfolio" aria-label="Full Portfolio" onClick={onLinkClick} />}
      onClick={onItemClick}
    >
      Portfolio
    </SidebarMenuButton>,
  );
  const link = screen.getByRole("link", { name: "Full Portfolio" });
  expect(ref.current).toBe(link);
  expect(link).not.toHaveAttribute("type");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  await user.click(link);
  expect(onLinkClick).toHaveBeenCalledOnce();
  expect(onItemClick).toHaveBeenCalledOnce();
});

it("keeps native button behavior without submitting its enclosing form", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const onClick = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  const { rerender } = render(
    <form onSubmit={onSubmit}>
      <SidebarMenuButton ref={ref} onClick={onClick}>
        Open
      </SidebarMenuButton>
    </form>,
  );
  expect(ref.current).toBe(screen.getByRole("button", { name: "Open" }));
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(onClick).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
  rerender(
    <SidebarMenuButton onClick={onClick} disabled>
      Open
    </SidebarMenuButton>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(onClick).toHaveBeenCalledOnce();
});
