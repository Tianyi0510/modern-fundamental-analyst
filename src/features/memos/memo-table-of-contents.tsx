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
      className="memo-toc mb-[var(--space-section-content)] border-y border-border"
    >
      <CollapsibleTrigger className="group flex min-h-[var(--size-touch-target)] w-full items-center gap-4 py-[var(--space-16px)] text-left text-large-label hover:text-brand">
        <List className="size-5 shrink-0" aria-hidden="true" />
        <span>{labels[locale]}</span>
        <ChevronDown
          className="memo-toc-chevron ml-auto size-5 shrink-0 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-aria-expanded:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent keepMounted className={disclosureStyles.panel}>
        <nav aria-label={labels[locale]} className="pb-[var(--space-24px)]">
          <ol lang={language} className="grid text-small-body">
            {entries.map((entry) => (
              <li key={entry.id} className={entry.level === 3 ? "pl-[var(--space-24px)]" : "font-bold"}>
                <a
                  href={`#${entry.id}`}
                  className="flex min-h-[var(--size-touch-target)] items-center py-[calc(var(--space-24px)/2)] wrap-anywhere underline-offset-4 hover:text-brand hover:underline focus-visible:underline"
                >
                  <span>{entry.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}
