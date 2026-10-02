import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "m-0 min-h-[var(--size-status-reserve)] leading-[var(--leading-body)] tracking-[var(--tracking-body)]",
  {
    variants: {
      tone: {
        standard: "text-[length:var(--font-size-body)]",
        inverse: "text-white text-[length:var(--font-size-caption)] font-bold",
      },
    },
    defaultVariants: { tone: "standard" },
  },
);
export function Alert({
  className,
  tone,
  role = "status",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  );
}
