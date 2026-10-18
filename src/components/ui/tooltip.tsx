"use client";

// Adapted from the shadcn/ui Base UI Tooltip composition.
import { Tooltip as Primitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

export function TooltipProvider({ delay = 600, ...props }: Primitive.Provider.Props) {
  return <Primitive.Provider delay={delay} {...props} />;
}
export function Tooltip(props: Primitive.Root.Props) {
  return <Primitive.Root {...props} />;
}
export function TooltipTrigger(props: Primitive.Trigger.Props) {
  return <Primitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
export function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  children,
  ...props
}: Primitive.Popup.Props & Pick<Primitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-[var(--layer-popover)]"
      >
        <Primitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "max-w-[min(20rem,var(--available-width))] rounded-control bg-foreground px-3 py-2 text-small-body text-background shadow-[var(--shadow-popover)] transition-opacity duration-[var(--motion-duration-fast)] data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}
