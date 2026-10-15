import { createRef } from "react";
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
          <SidebarMenuButton asChild isActive aria-current="page">
            <a href="/portfolio">Portfolio</a>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild onClick={onNavigate}>
            <a href="/about" hrefLang="en">
              About
            </a>
          </SidebarMenuButton>
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
