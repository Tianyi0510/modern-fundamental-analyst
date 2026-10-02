"use client";
import type { ComponentProps } from "react";
import { Dialog as Primitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Sheet(props: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} />;
}
export function SheetTrigger(props: ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Trigger data-slot="sheet-trigger" {...props} />;
}
export function SheetTitle(props: ComponentProps<typeof Primitive.Title>) {
  return <Primitive.Title data-slot="sheet-title" {...props} />;
}
export function SheetContent({
  className,
  layerClassName,
  phase,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content> & { layerClassName?: string; phase?: string }) {
  return (
    <Primitive.Portal>
      <div className={cn("fixed inset-0 z-[100]", layerClassName)} data-state="open" data-menu-phase={phase}>
        <Primitive.Overlay data-slot="sheet-overlay" className="fixed inset-0 bg-transparent" />
        <Primitive.Content
          data-slot="sheet-content"
          className={cn("fixed inset-0 flex flex-col outline-none", className)}
          {...props}
        >
          {children}
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
