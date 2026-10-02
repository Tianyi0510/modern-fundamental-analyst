import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type FieldVariant = "standard" | "inverse";
const variants: Record<FieldVariant, string> = {
  standard:
    "border-black rounded-none bg-[var(--background-gray)] text-black focus-visible:outline-[var(--focus-ring-on-light)]",
  inverse:
    "border-[rgba(255,255,255,0.7)] rounded-pill bg-transparent text-white placeholder:text-[rgba(255,255,255,0.6)] focus-visible:outline-[var(--focus-ring-on-dark)]",
};
export function inputAppearance(variant: FieldVariant, className = "", multiline = false) {
  const height = multiline
    ? "min-h-[190px]"
    : variant === "inverse"
      ? "min-h-[var(--size-control)]"
      : "min-h-[var(--size-field)]";
  return cn(
    `block min-w-0 w-full border px-[var(--space-field-inline)] py-[var(--space-field-block)] text-[length:var(--font-size-body)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-normal transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] ${height} ${variants[variant]} `,
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
