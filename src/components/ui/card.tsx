import * as React from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm"; variant?: "default" | "plain" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col overflow-hidden text-small-body [--card-spacing:--spacing(4)] data-[size=sm]:[--card-spacing:--spacing(3)]",
        variant === "plain"
          ? "gap-0 text-inherit"
          : "gap-(--card-spacing) rounded-surface bg-card py-(--card-spacing) text-card-foreground ring-1 ring-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-none px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-small-body text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center rounded-b-none border-t border-border bg-muted p-(--card-spacing)", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardDescription, CardContent };
