"use client";
import type { ComponentProps } from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function DropdownMenu(props: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} />;
}
export function DropdownMenuTrigger(props: ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
export function DropdownMenuContent({
  className,
  sideOffset = 10,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[110] max-h-[var(--radix-dropdown-menu-content-available-height)] w-40 overflow-y-auto rounded-[var(--radius-menu)] border border-[var(--gray)] bg-white text-black shadow-[0_16px_40px_rgba(0,0,0,0.12)] outline-none",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item data-slot="dropdown-menu-item" className={cn("outline-none", className)} {...props} />;
}
