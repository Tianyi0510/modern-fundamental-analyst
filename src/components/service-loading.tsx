import { appearance } from "./service-loading.styles";
import { Skeleton } from "./ui/skeleton";
import type { Locale } from "@/lib/i18n";

const copy = { en: "Loading…", "zh-tw": "載入中…", "zh-cn": "加载中…" };

export function ServiceLoading({ locale }: { locale: Locale }) {
  return (
    <div className={appearance["shell"]} role="status" aria-live="polite" aria-busy="true">
      <span>{copy[locale]}</span>
      <div className="mt-[var(--space-16px)] grid gap-[var(--space-8px)]" aria-hidden="true">
        <Skeleton className="h-[var(--space-24px)] w-2/3" />
        <Skeleton className="h-[var(--space-16px)] w-full" />
      </div>
    </div>
  );
}
