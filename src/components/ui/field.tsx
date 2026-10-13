import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function FieldGroup({
  className,
  layout = "stack",
  ...props
}: ComponentProps<"div"> & { layout?: "stack" | "contents" }) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        layout === "contents" ? "contents" : "flex min-w-0 flex-col gap-[var(--space-form-row)]",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      role="group"
      className={cn("grid min-w-0 gap-[var(--space-field-label)]", className)}
      {...props}
    />
  );
}
export function FieldLabel({ className, htmlFor, ...props }: ComponentProps<"label"> & { htmlFor: string }) {
  return (
    <label
      data-slot="field-label"
      htmlFor={htmlFor}
      className={cn(
        "text-[length:var(--font-size-label)] leading-[var(--leading-body)] font-bold tracking-[var(--tracking-label)]",
        className,
      )}
      {...props}
    />
  );
}
export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "m-0 text-[length:var(--font-size-caption)] leading-[var(--leading-body)] text-[var(--text-secondary)]",
        className,
      )}
      {...props}
    />
  );
}
export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("m-0 text-[length:var(--font-size-body)] leading-[var(--leading-body)]", className)}
      {...props}
    />
  );
}
