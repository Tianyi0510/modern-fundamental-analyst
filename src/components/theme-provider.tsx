"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="mfa:theme:v1"
    >
      {children}
    </NextThemesProvider>
  );
}
