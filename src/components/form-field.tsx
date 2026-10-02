import type { ComponentProps, ReactNode } from "react";
import { inputAppearance } from "./ui/input";

export function FormField({
  label,
  children,
  className = "",
  visibility = "visible",
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  visibility?: "visible" | "hidden";
}) {
  return (
    <label className={`min-w-0 grid gap-[var(--space-field-label)] ${className}`}>
      <span
        className={
          visibility === "hidden"
            ? "sr-only"
            : "text-[length:var(--font-size-label)] leading-[var(--leading-body)] tracking-[var(--tracking-label)] font-bold"
        }
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export function SelectControl({ className, ...props }: ComponentProps<"select">) {
  return <select className={inputAppearance("standard", className)} {...props} />;
}
