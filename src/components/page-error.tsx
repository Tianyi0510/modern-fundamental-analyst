"use client";

import { appearance } from "./page-error.styles";
import { Button } from "./ui/button";

import Link from "next/link";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const copy = {
  en: { title: "This page could not be loaded.", retry: "Try again", home: "Return home" },
  "zh-tw": { title: "目前無法載入此頁面。", retry: "重試", home: "返回首頁" },
  "zh-cn": { title: "目前无法加载此页面。", retry: "重试", home: "返回首页" },
};

export function PageError({ locale, retry }: { locale: Locale; retry: () => void }) {
  const text = copy[locale];
  return (
    <main className={appearance["not-found"]} id="main-content" tabIndex={-1}>
      <h1>{text.title}</h1>
      <Button type="button" onClick={retry}>
        {text.retry}
      </Button>
      <Link className={appearance["text-link"]} href={getLocalizedPath("/", locale)}>
        {text.home}
      </Link>
    </main>
  );
}
