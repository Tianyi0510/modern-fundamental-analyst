"use client";
import type { ComponentProps } from "react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

export function Sheet(props: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root {...props} />;
}
export function SheetTrigger(props: ComponentProps<typeof Primitive.Trigger>) {
  return <Primitive.Trigger data-slot="sheet-trigger" {...props} />;
}
export function SheetClose(props: ComponentProps<typeof Primitive.Close>) {
  return <Primitive.Close data-slot="sheet-close" {...props} />;
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
}: Omit<ComponentProps<typeof Primitive.Popup>, "className"> & {
  className?: string;
  layerClassName?: string;
  phase?: string;
}) {
  return (
    <Primitive.Portal>
      <div
        className={cn("fixed inset-0 z-[var(--layer-modal)]", layerClassName)}
        data-state="open"
        data-menu-phase={phase}
      >
        <Primitive.Backdrop data-slot="sheet-overlay" className="fixed inset-0 bg-transparent" />
        <Primitive.Popup
          data-slot="sheet-content"
          className={cn("fixed inset-0 flex flex-col outline-none", className)}
          {...props}
        >
          {children}
        </Primitive.Popup>
      </div>
    </Primitive.Portal>
  );
}
