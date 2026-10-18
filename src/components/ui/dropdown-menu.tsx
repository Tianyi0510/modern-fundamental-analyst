"use client";
import type { ComponentProps } from "react";
import { Menu as Primitive } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";

export function DropdownMenu(props: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} />;
}
export function DropdownMenuGroup(props: ComponentProps<typeof Primitive.Group>) {
  return <Primitive.Group data-slot="dropdown-menu-group" {...props} />;
}
export function DropdownMenuTrigger(props: ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
export function DropdownMenuContent({
  className,
  sideOffset = 10,
  align = "center",
  ...props
}: Omit<ComponentProps<typeof Primitive.Popup>, "className"> & {
  className?: string;
  align?: ComponentProps<typeof Primitive.Positioner>["align"];
  sideOffset?: number;
}) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        sideOffset={sideOffset}
        align={align}
        positionMethod="fixed"
        className="z-[var(--layer-popover)]"
      >
        <Primitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "max-h-[var(--available-height)] w-40 overflow-y-auto rounded-[var(--radius-menu)] bg-surface p-[var(--space-2)] text-ink shadow-[var(--shadow-popover)] transition-opacity duration-[var(--motion-duration-enter)] ease-[var(--motion-ease-emphasized)] outline-none data-ending-style:opacity-0 data-ending-style:duration-[var(--motion-duration-exit)] data-ending-style:ease-[var(--motion-ease-exit)] data-starting-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: Omit<ComponentProps<typeof Primitive.Item>, "className"> & { className?: string }) {
  return <Primitive.Item data-slot="dropdown-menu-item" className={cn("outline-none", className)} {...props} />;
}
