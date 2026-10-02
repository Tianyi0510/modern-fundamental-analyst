import type { ComponentProps } from "react";

const tones = {
  standard: "text-[length:var(--font-size-body)] leading-[var(--leading-body)] tracking-[var(--tracking-body)]",
  inverse:
    "text-white text-[length:var(--font-size-caption)] leading-[var(--leading-body)] tracking-[var(--tracking-body)] font-bold",
} as const;
export function StatusMessage({
  tone = "standard",
  className = "",
  ...props
}: ComponentProps<"p"> & { tone?: keyof typeof tones }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`m-0 min-h-[var(--size-status-reserve)] ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
