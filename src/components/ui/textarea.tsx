import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { inputAppearance } from "./input";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputAppearance("standard", "", true), "resize-y", className)}
      {...props}
    />
  );
}
