import type { ComponentProps } from "react";
import { inputAppearance } from "./input";

// Keep the browser's native arrow and mobile picker, including disabled appearance.
export function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return <select data-slot="native-select" className={inputAppearance("standard", className)} {...props} />;
}
