"use client";

import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Preserve Safari list semantics outside nav when CSS removes markers.
    <ul
      role="list"
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("relative min-w-0", className)}
      {...props}
    />
  );
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean }) {
  const Component = asChild ? Slot.Root : "button";
  return (
    <Component
      type={asChild ? undefined : "button"}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        "grid min-h-[56px] w-full min-w-0 grid-cols-[minmax(0,1fr)] items-center bg-transparent px-[var(--space-2)] py-[var(--space-2)] text-left text-title-small [overflow-wrap:anywhere] whitespace-normal text-black transition-[color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] outline-none hover:text-accent focus-visible:text-accent focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-[0.2em] active:text-accent disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)] data-[active=true]:text-accent touch:[&:hover:not([data-active=true]):not(:active):not(:focus-visible)]:text-black",
        className,
      )}
      {...props}
    />
  );
}
