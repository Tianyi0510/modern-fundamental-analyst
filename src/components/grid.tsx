import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const columns = {
  2: "min-[801px]:grid-cols-2",
  3: "min-[801px]:grid-cols-2 min-[1101px]:grid-cols-3",
} as const;

export function Grid({
  columns: columnCount = 3,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: keyof typeof columns }) {
  return (
    <div
      {...props}
      data-slot="grid"
      className={cn("grid min-w-0 grid-cols-1 gap-px bg-[var(--grid-guide)]", columns[columnCount], className)}
    />
  );
}
