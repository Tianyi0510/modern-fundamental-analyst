import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type FieldVariant = "standard" | "inverse";
const variants: Record<FieldVariant, string> = {
  standard:
    "border-[var(--field-border)] rounded-field bg-[var(--field-surface)] text-[var(--field-text)] placeholder:text-[var(--field-text)] placeholder:opacity-100 focus-visible:outline-[var(--field-focus-ring)] focus-visible:border-[var(--field-focus-border)]",
  inverse:
    "border-[var(--field-inverse-border)] rounded-action bg-transparent text-[var(--field-inverse-text)] placeholder:text-[var(--field-inverse-placeholder)] focus-visible:outline-[var(--focus-ring-on-dark)]",
};
export function inputAppearance(variant: FieldVariant, className = "", multiline = false) {
  const height = multiline
    ? "min-h-[176px]"
    : variant === "inverse"
      ? "min-h-[var(--size-control)]"
      : "min-h-[var(--size-field)]";
  return cn(
    `block w-full min-w-0 border px-[var(--space-field-inline)] py-[var(--space-field-block)] text-small-body transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] disabled:cursor-not-allowed disabled:border-dashed ${height} ${variants[variant]}`,
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
