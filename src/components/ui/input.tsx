import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type FieldVariant = "standard" | "inverse";
const variants: Record<FieldVariant, string> = {
  standard:
    "border-[var(--border-field)] rounded-field bg-[var(--surface-muted)] text-ink placeholder:text-[var(--text-secondary)] focus-visible:outline-[var(--focus-ring-on-light)]",
  inverse:
    "border-[var(--border-field-inverse)] rounded-pill bg-transparent text-inverse placeholder:text-[var(--text-placeholder-inverse)] focus-visible:outline-[var(--focus-ring-on-dark)]",
};
export function inputAppearance(variant: FieldVariant, className = "", multiline = false) {
  const height = multiline
    ? "min-h-[190px]"
    : variant === "inverse"
      ? "min-h-[var(--size-control)]"
      : "min-h-[var(--size-field)]";
  return cn(
    `block w-full min-w-0 border px-[var(--space-field-padding-inline)] py-[var(--space-field-padding-block)] text-body-large transition-[border-color,box-shadow] duration-[var(--motion-effects-fast-duration)] ease-[var(--motion-effects-fast-easing)] disabled:cursor-not-allowed disabled:border-dashed ${height} ${variants[variant]}`,
    className,
  );
}
export function Input({
  variant = "standard",
  className,
  ...props
}: ComponentProps<"input"> & { variant?: FieldVariant }) {
  return <input data-slot="input" className={inputAppearance(variant, className)} {...props} />;
}
