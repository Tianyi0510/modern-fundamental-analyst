import { appearance } from "./service-loading.styles";
import type { Locale } from "@/lib/i18n";

const copy = { en: "Loading…", "zh-tw": "載入中…", "zh-cn": "加载中…" };

export function ServiceLoading({ locale }: { locale: Locale }) {
  return (
    <p className={appearance["shell"]} role="status" aria-live="polite" aria-busy="true">
      {copy[locale]}
    </p>
  );
}
