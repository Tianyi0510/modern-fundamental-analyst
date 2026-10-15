import { appearance } from "./service-loading.styles";
import { Skeleton } from "./ui/skeleton";
import type { Locale } from "@/lib/i18n";

const copy = { en: "Loading…", "zh-tw": "載入中…", "zh-cn": "加载中…" };

export function ServiceLoading({ locale }: { locale: Locale }) {
  return (
    <div className={appearance["shell"]} role="status" aria-live="polite" aria-busy="true">
      <span>{copy[locale]}</span>
      <div className="mt-[var(--space-200)] grid gap-[var(--space-150)]" aria-hidden="true">
        <Skeleton className="h-[var(--space-300)] w-2/3" />
        <Skeleton className="h-[var(--space-200)] w-full" />
      </div>
    </div>
  );
}
