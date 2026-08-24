import type { Resend } from "resend";
import type { Locale } from "@/lib/i18n";

const preferredLanguageSegments = {
  en: "39c96ed5-94c2-4755-876a-b29b414433e0",
  "zh-tw": "4e7fa9d7-7df1-42a9-a6d0-224f6a59b982",
  "zh-cn": "84cc2bde-6d03-4497-b21b-84c1d4fc265e",
} satisfies Record<Locale, string>;

const languageSegmentIds = new Set(Object.values(preferredLanguageSegments));

export function getPreferredLanguageSegmentId(locale: Locale) {
  return preferredLanguageSegments[locale];
}

export function getLocaleFromPreferredLanguage(value: unknown): Locale {
  if (value === "繁體中文") return "zh-tw";
  if (value === "简体中文") return "zh-cn";
  return "en";
}

export async function syncPreferredLanguageSegment(resend: Resend, email: string, locale: Locale) {
  const targetId = getPreferredLanguageSegmentId(locale);
  const current = await resend.contacts.segments.list({ email, limit: 100 });
  if (current.error) throw new Error(`Unable to read contact segments: ${current.error.name}`);

  const currentLanguageIds = current.data?.data
    .map(({ id }) => id)
    .filter((id) => languageSegmentIds.has(id)) ?? [];

  if (!currentLanguageIds.includes(targetId)) {
    const added = await resend.contacts.segments.add({ email, segmentId: targetId });
    if (added.error) throw new Error(`Unable to add preferred language segment: ${added.error.name}`);
  }

  for (const segmentId of currentLanguageIds) {
    if (segmentId === targetId) continue;
    const removed = await resend.contacts.segments.remove({ email, segmentId });
    if (removed.error) throw new Error(`Unable to remove previous language segment: ${removed.error.name}`);
  }
}
