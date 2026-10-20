import type { ReactNode } from "react";
import { Card, CardContent } from "./ui/card";

// Footer forms keep their inverse surface; page forms share the same panel spacing.
export function FormPanel({
  children,
  variant = "standard",
}: {
  children: ReactNode;
  variant?: "standard" | "inverse";
}) {
  if (variant === "inverse") return children;
  return (
    <Card className="min-w-0 gap-0 p-[var(--space-6)] compact:p-[var(--space-4)]">
      <CardContent className="min-w-0 px-0">{children}</CardContent>
    </Card>
  );
}
