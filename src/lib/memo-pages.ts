import type { Metadata } from "next";
import { getMemo } from "@/data/memos";
import type { Locale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/site-config";

export function createMemoPageMetadata(slug: string, locale: Locale): Metadata {
  const memo = getMemo(slug, locale);
  if (!memo) return {};
  return createPageMetadata({ title: memo.title, description: memo.summary, path: `/memos/${slug}`, locale });
}
