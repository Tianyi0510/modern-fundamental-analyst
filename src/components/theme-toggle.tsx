"use client";

import type { Ref } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import type { Locale } from "@/lib/i18n";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useHydrated } from "./use-hydrated";

const copy = {
  en: { loading: "Appearance", light: "Switch to Light Mode", dark: "Switch to Dark Mode" },
  "zh-tw": { loading: "外觀", light: "切換至淺色模式", dark: "切換至深色模式" },
  "zh-cn": { loading: "外观", light: "切换至浅色模式", dark: "切换至深色模式" },
};

export function ThemeToggle({ locale, buttonRef }: { locale: Locale; buttonRef?: Ref<HTMLButtonElement> }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = resolvedTheme === "dark";
  const text = copy[locale];
  const label = hydrated ? (isDark ? text.light : text.dark) : text.loading;
  const Icon = hydrated ? (isDark ? Sun : Moon) : SunMoon;

  return (
    <TooltipProvider>
      <Tooltip disabled={!hydrated}>
        <TooltipTrigger
          render={
            <Button
              ref={buttonRef}
              variant="quiet"
              size="icon"
              data-theme-toggle=""
              aria-label={label}
              disabled={!hydrated}
              disabledFeedback="muted"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            />
          }
        >
          <Icon aria-hidden="true" data-icon="inline-start" />
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
