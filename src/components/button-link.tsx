import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonAppearance, type ButtonSize, type ButtonVariant } from "./ui/button";

export function ButtonLink({
  variant = "primary",
  size = "regular",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link data-touch-feedback="" className={buttonAppearance(variant, size, className)} {...props} />;
}
