import type { ComponentProps } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "contrast" | "inverse";
export type ButtonDisabledFeedback = "standard" | "muted" | "muted-busy";
export type ButtonSize = "regular" | "small";

const variants: Record<ButtonVariant, string> = {
  primary:
    "button-dark bg-black text-white [&:hover:not(:disabled)]:bg-brand [&:focus-visible:not(:disabled)]:bg-brand touch:[&:hover:not(:active):not(:focus-visible)]:bg-black touch:[&:hover:not(:active):not(:focus-visible)]:text-white touch:[&:active:not(:disabled)]:bg-brand touch:[&:active:not(:disabled)]:text-white",
  contrast:
    "button-dark bg-black text-white [&:hover:not(:disabled)]:bg-highlight [&:hover:not(:disabled)]:text-black [&:focus-visible:not(:disabled)]:bg-highlight [&:focus-visible:not(:disabled)]:text-black touch:[&:hover:not(:active):not(:focus-visible)]:bg-black touch:[&:hover:not(:active):not(:focus-visible)]:text-white touch:[&:active:not(:disabled)]:bg-highlight touch:[&:active:not(:disabled)]:text-black",
  inverse:
    "bg-white text-black border border-white [&:hover:not(:disabled)]:bg-highlight [&:hover:not(:disabled)]:border-highlight [&:focus-visible:not(:disabled)]:bg-highlight [&:focus-visible:not(:disabled)]:border-highlight touch:[&:hover:not(:active):not(:focus-visible)]:bg-white touch:[&:hover:not(:active):not(:focus-visible)]:border-white touch:[&:active:not(:disabled)]:bg-highlight touch:[&:active:not(:disabled)]:border-highlight",
};
const sizes: Record<ButtonSize, string> = {
  regular: "min-h-[var(--size-control)] px-[1.6em] gap-[1.333em]",
  small: "button-small min-h-[var(--size-control-small)] px-[1.333em] gap-[1.333em]",
};

const disabledFeedback: Record<ButtonDisabledFeedback, string> = {
  standard: "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled)]",
  muted: "disabled:cursor-default disabled:opacity-[var(--opacity-disabled-preferences)]",
  "muted-busy": "disabled:cursor-wait disabled:opacity-[var(--opacity-disabled-preferences)]",
};

const interaction =
  "origin-center transition-[transform,background-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] [&:hover:not(:active):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:focus-visible:not(:active):not(:disabled)]:[transform:scale(var(--motion-scale-hover))] [&:active:not(:disabled)]:[transform:scale(var(--motion-scale-press))] [&:active:not(:disabled)]:duration-[var(--motion-duration-press)] disabled:transform-none touch:[&:hover:not(:active):not(:focus-visible)]:transform-none motion-reduce:transform-none!";

export const buttonVariants = cva(
  `button inline-flex items-center justify-center rounded-pill text-[length:var(--font-size-control)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-bold ${interaction}`,
  {
    variants: { variant: variants, size: sizes, disabledFeedback },
    defaultVariants: { variant: "primary", size: "regular", disabledFeedback: "standard" },
  },
);

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
      type={type}
      className={buttonAppearance(variant, size, className, disabledFeedback)}
      {...props}
    />
  );
}
