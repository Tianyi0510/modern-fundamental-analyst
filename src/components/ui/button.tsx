import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "contrast" | "inverse" | "quiet";
export type ButtonDisabledFeedback = "standard" | "muted" | "muted-busy";
export type ButtonSize = "regular" | "small" | "text";

const variants: Record<ButtonVariant, string> = {
  quiet:
    "touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:bg-transparent rounded-control bg-transparent text-[var(--action-quiet-text)] [&:hover:not(:disabled)]:bg-[var(--action-quiet-hover-surface)] [&:focus-visible:not(:disabled)]:bg-[var(--action-quiet-hover-surface)] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:bg-[var(--action-quiet-hover-surface)]",
  primary:
    "button-dark border border-[var(--action-primary-surface)] bg-[var(--action-primary-surface)] text-[var(--action-primary-text)] [&:hover:not(:disabled)]:bg-[var(--action-primary-hover-surface)] [&:hover:not(:disabled)]:text-[var(--action-primary-hover-text)] [&:hover:not(:disabled)]:border-[var(--action-primary-hover-surface)] [&:focus-visible:not(:disabled)]:bg-[var(--action-primary-hover-surface)] [&:focus-visible:not(:disabled)]:text-[var(--action-primary-hover-text)] [&:focus-visible:not(:disabled)]:border-[var(--action-primary-hover-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:bg-[var(--action-primary-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:border-[var(--action-primary-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:text-[var(--action-primary-text)] touch:[&:is(:active,[data-touch-pressed=true]):not(:disabled)]:bg-[var(--action-primary-hover-surface)] touch:[&:is(:active,[data-touch-pressed=true]):not(:disabled)]:text-[var(--action-primary-hover-text)]",
  contrast:
    "button-dark border border-[var(--action-contrast-surface)] bg-[var(--action-contrast-surface)] text-[var(--action-contrast-text)] [&:hover:not(:disabled)]:bg-[var(--action-contrast-hover-surface)] [&:hover:not(:disabled)]:border-[var(--action-contrast-hover-surface)] [&:hover:not(:disabled)]:text-[var(--action-contrast-hover-text)] [&:focus-visible:not(:disabled)]:bg-[var(--action-contrast-hover-surface)] [&:focus-visible:not(:disabled)]:border-[var(--action-contrast-hover-surface)] [&:focus-visible:not(:disabled)]:text-[var(--action-contrast-hover-text)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:bg-[var(--action-contrast-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:border-[var(--action-contrast-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:text-[var(--action-contrast-text)] touch:[&:is(:active,[data-touch-pressed=true]):not(:disabled)]:bg-[var(--action-contrast-hover-surface)] touch:[&:is(:active,[data-touch-pressed=true]):not(:disabled)]:text-[var(--action-contrast-hover-text)]",
  inverse:
    "border border-[var(--action-inverse-surface)] bg-[var(--action-inverse-surface)] text-[var(--action-inverse-text)] [&:hover:not(:disabled)]:bg-[var(--action-inverse-hover-surface)] [&:hover:not(:disabled)]:border-[var(--action-inverse-hover-surface)] [&:focus-visible:not(:disabled)]:bg-[var(--action-inverse-hover-surface)] [&:focus-visible:not(:disabled)]:border-[var(--action-inverse-hover-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:bg-[var(--action-inverse-surface)] touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:border-[var(--action-inverse-surface)] touch:[&:is(:active,[data-touch-pressed=true]):not(:disabled)]:bg-[var(--action-inverse-hover-surface)]",
};
const sizes: Record<ButtonSize, string> = {
  text: "min-h-[var(--size-touch-target)] px-[var(--space-3)]",
  regular: "min-h-[var(--size-control)] px-[1.6em] gap-[1.333em]",
  small: "button-small min-h-[var(--size-control-small)] px-[1.333em] gap-[1.333em]",
};

const disabledFeedback: Record<ButtonDisabledFeedback, string> = {
  standard: "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled)]",
  muted: "disabled:cursor-default disabled:opacity-[var(--opacity-disabled-preferences)]",
  "muted-busy": "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled-preferences)]",
};

const interaction =
  "origin-center transition-[transform,background-color,border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] [&:hover:not(:is(:active,[data-touch-pressed=true])):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:focus-visible:not(:is(:active,[data-touch-pressed=true])):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:[transform:scale(var(--motion-scale-press))] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:duration-[var(--motion-duration-press)] disabled:transform-none touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:transform-none motion-reduce:transform-none!";

const buttonVariants = cva(`button inline-flex items-center justify-center text-control ${interaction}`, {
  variants: { variant: variants, size: sizes, disabledFeedback },
  compoundVariants: [{ variant: ["primary", "contrast", "inverse"], className: "rounded-action" }],
  defaultVariants: { variant: "primary", size: "regular", disabledFeedback: "standard" },
});

export function buttonAppearance(
  variant: ButtonVariant,
  size: ButtonSize,
  className = "",
  feedback: ButtonDisabledFeedback = "standard",
) {
  return cn(buttonVariants({ variant, size, disabledFeedback: feedback }), className);
}

export function Button({
  variant = "primary",
  size = "regular",
  className,
  type = "button",
  disabledFeedback = "standard",
  ...props
}: ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabledFeedback?: ButtonDisabledFeedback;
}) {
  return (
    <button
      data-slot="button"
      data-touch-feedback=""
      type={type}
      className={buttonAppearance(variant, size, className, disabledFeedback)}
      {...props}
    />
  );
}
