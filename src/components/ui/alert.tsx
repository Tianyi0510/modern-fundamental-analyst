import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("m-0 min-h-[var(--size-status-reserve)]", {
  variants: {
    tone: {
      standard: "text-small-body",
      inverse: "font-bold text-[var(--text-inverse)]",
    },
  },
  defaultVariants: { tone: "standard" },
});
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

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("min-w-0", className)} {...props} />;
}

export function AlertAction({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("min-w-0", className)} {...props} />;
}
