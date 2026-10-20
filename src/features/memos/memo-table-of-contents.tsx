"use client";

import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import disclosureStyles from "@/components/animated-disclosure.module.css";
import type { Locale } from "@/lib/i18n";

const labels = { en: "On This Page", "zh-tw": "本頁目錄", "zh-cn": "本页目录" };

export function MemoTableOfContents({
  entries,
  locale,
  language,
}: {
  entries: Array<{ id: string; title: string; level: 2 | 3 }>;
  locale: Locale;
  language: Locale;
}) {
  const [open, setOpen] = useState(false);
  if (!entries.length) return null;
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="memo-toc mb-[var(--space-section-content)] w-[min(var(--width-article),100%)] border-y border-border"
    >
      <CollapsibleTrigger className="group flex min-h-[var(--size-touch-target)] w-full items-center gap-3 py-[var(--space-4)] text-left text-large-label hover:text-brand">
        <List className="size-5 shrink-0" aria-hidden="true" />
        <span>{labels[locale]}</span>
        <ChevronDown
          className="memo-toc-chevron ml-auto size-5 shrink-0 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-aria-expanded:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent keepMounted className={disclosureStyles.panel}>
        <nav aria-label={labels[locale]} className="pb-[var(--space-5)]">
          <ol lang={language} className="grid gap-1 text-small-body">
            {entries.map((entry) => (
              <li key={entry.id} className={entry.level === 3 ? "pl-[var(--space-5)]" : "pt-2 font-bold first:pt-0"}>
                <a
                  href={`#${entry.id}`}
                  className="flex min-h-[var(--size-touch-target)] items-center py-2 wrap-anywhere underline-offset-4 hover:text-brand hover:underline focus-visible:underline"
                >
                  {entry.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}
