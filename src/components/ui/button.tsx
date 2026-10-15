import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "contrast" | "inverse" | "quiet";
export type ButtonDisabledFeedback = "standard" | "muted" | "muted-busy";
export type ButtonSize = "regular" | "small" | "text";

const variants: Record<ButtonVariant, string> = {
  primary: "button-dark [--button-surface:var(--surface-brand)] [--button-content:var(--text-inverse)]",
  contrast: "button-dark [--button-surface:var(--surface-inverse)] [--button-content:var(--text-inverse)]",
  inverse:
    "border border-line-inverse [--button-surface:var(--surface-primary)] [--button-content:var(--text-primary)] focus-visible:outline-[var(--focus-ring-on-dark)]",
  quiet:
    "rounded-quiet [--button-surface:transparent] [--button-content:var(--text-interactive)] transition-[color,background-color,transform] duration-[var(--motion-effects-fast-duration)] ease-[var(--motion-effects-fast-easing)] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:[transform:scale(var(--motion-scale-press))] disabled:transform-none motion-reduce:transform-none!",
};

const surfaceFeedback =
  "bg-[var(--button-surface)] text-[var(--button-content)] [--button-hover:color-mix(in_srgb,var(--button-content)_var(--state-hover),var(--button-surface))] [--button-focus:color-mix(in_srgb,var(--button-content)_var(--state-focus),var(--button-surface))] [--button-pressed:color-mix(in_srgb,var(--button-content)_var(--state-pressed),var(--button-surface))] [@media(hover:hover)]:[&:hover:not(:disabled):not(:focus-visible):not(:is(:active,[data-touch-pressed=true]))]:bg-[var(--button-hover)] [&:focus-visible:not(:disabled):not(:is(:active,[data-touch-pressed=true]))]:bg-[var(--button-focus)] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:bg-[var(--button-pressed)]";

const sizes: Record<ButtonSize, string> = {
  text: "min-h-[var(--size-touch-target)] px-[var(--space-75)]",
  regular: "min-h-[var(--size-control)] px-[var(--space-button-padding-inline)] gap-[var(--space-button-icon-gap)]",
  small:
    "button-small min-h-[var(--size-control-small)] px-[var(--space-button-small-padding-inline)] gap-[var(--space-button-icon-gap)]",
};

const disabledFeedback: Record<ButtonDisabledFeedback, string> = {
  standard: "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled)]",
  muted: "disabled:cursor-default disabled:opacity-[var(--opacity-disabled-preferences)]",
  "muted-busy": "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled-preferences)]",
};

const interaction =
  "origin-center [transition:transform_var(--motion-spatial-fast-duration)_var(--motion-spatial-fast-easing),_color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing),_background-color_var(--motion-effects-fast-duration)_var(--motion-effects-fast-easing)] [&:hover:not(:is(:active,[data-touch-pressed=true])):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:focus-visible:not(:is(:active,[data-touch-pressed=true])):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:is(:active,[data-touch-pressed=true]):not(:disabled)]:[transform:scale(var(--motion-scale-press))] disabled:transform-none touch:[&:hover:not(:is(:active,[data-touch-pressed=true])):not(:focus-visible)]:transform-none motion-reduce:transform-none!";

export const buttonVariants = cva(`button inline-flex items-center justify-center text-control ${surfaceFeedback}`, {
  variants: { variant: variants, size: sizes, disabledFeedback },
  compoundVariants: [{ variant: ["primary", "contrast", "inverse"], className: `rounded-pill ${interaction}` }],
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
