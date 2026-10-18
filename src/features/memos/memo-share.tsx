"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, createToastManager } from "@/components/ui/toast";
import { useHydrated } from "@/components/use-hydrated";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    copy: "Copy Article Link",
    copied: "Article link copied.",
    failed: "Couldn't copy the link. Copy it from your address bar.",
    close: "Close Notification",
    notifications: "Notifications",
  },
  "zh-tw": {
    copy: "複製文章連結",
    copied: "已複製文章連結。",
    failed: "無法複製連結，請從網址列複製。",
    close: "關閉通知",
    notifications: "通知",
  },
  "zh-cn": {
    copy: "复制文章链接",
    copied: "已复制文章链接。",
    failed: "无法复制链接，请从地址栏复制。",
    close: "关闭通知",
    notifications: "通知",
  },
};

export function MemoShare({ locale }: { locale: Locale }) {
  const [manager] = useState(() => createToastManager());
  const [copying, setCopying] = useState(false);
  const hydrated = useHydrated();
  const text = copy[locale];
  async function copyLink() {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}`);
      manager.add({ title: text.copied, type: "success" });
    } catch {
      manager.add({ title: text.failed, type: "error" });
    } finally {
      setCopying(false);
    }
  }
  return (
    <Toaster limit={1} toastManager={manager} closeLabel={text.close} regionLabel={text.notifications}>
      <Button
        variant="quiet"
        size="small"
        disabled={!hydrated || copying}
        onClick={() => {
          void copyLink();
        }}
        className="max-w-full gap-2 whitespace-normal"
      >
        <Copy aria-hidden="true" />
        {text.copy}
      </Button>
    </Toaster>
  );
}
