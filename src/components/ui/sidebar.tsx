"use client";

import type { ComponentProps } from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles -- Preserve Safari list semantics outside nav when CSS removes markers.
    <ul
      role="list"
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-[calc(var(--space-2)/2)]", className)}
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
  render,
  ref,
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"button"> & { isActive?: boolean }) {
  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: {
      type: render ? undefined : "button",
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-active": isActive,
      ...props,
      className: cn(
        "flex min-h-[var(--size-touch-target)] w-full min-w-0 items-center gap-[var(--space-3)] rounded-control bg-transparent px-[var(--space-3)] py-[var(--space-3)] text-left text-medium-label [overflow-wrap:anywhere] whitespace-normal text-[var(--sidebar-text)] transition-[color,background-color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] outline-none hover:text-accent hover:not-data-[active=true]:bg-[var(--sidebar-hover-surface)] focus-visible:text-accent focus-visible:outline-[length:var(--focus-ring-width)] focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)] focus-visible:outline-accent focus-visible:outline-solid focus-visible:not-data-[active=true]:bg-[var(--sidebar-hover-surface)] active:bg-[var(--sidebar-pressed-surface)] active:text-accent disabled:pointer-events-none disabled:opacity-[var(--opacity-disabled)] data-[active=true]:bg-[var(--sidebar-selected-surface)] data-[active=true]:text-accent touch:[&:hover:not([data-active=true]):not(:active):not(:focus-visible)]:bg-transparent touch:[&:hover:not([data-active=true]):not(:active):not(:focus-visible)]:text-[var(--sidebar-text)] [&>span]:min-w-0 [&>svg]:size-[18px] [&>svg]:shrink-0",
        className,
      ),
    },
  });
}
