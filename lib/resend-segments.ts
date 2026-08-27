import type { Resend } from "resend";
import type { Locale } from "@/lib/i18n";

const preferredLanguageSegments = {
  en: process.env.RESEND_SEGMENT_EN || "39c96ed5-94c2-4755-876a-b29b414433e0",
  "zh-tw": process.env.RESEND_SEGMENT_ZH_TW || "4e7fa9d7-7df1-42a9-a6d0-224f6a59b982",
  "zh-cn": process.env.RESEND_SEGMENT_ZH_CN || "84cc2bde-6d03-4497-b21b-84c1d4fc265e",
} satisfies Record<Locale, string>;

const languageSegmentIds = new Set(Object.values(preferredLanguageSegments));

export function getPreferredLanguageSegmentId(locale: Locale) {
  return preferredLanguageSegments[locale];
}

type SegmentRollback = () => Promise<void>;

async function restorePreferredLanguageSegments(
  resend: Resend,
  email: string,
  segmentIds: ReadonlyArray<string>,
  removeTarget: boolean,
  targetId: string,
) {
  const results = await Promise.allSettled([
    ...segmentIds.map((segmentId) => resend.contacts.segments.add({ email, segmentId })),
    ...(removeTarget ? [resend.contacts.segments.remove({ email, segmentId: targetId })] : []),
  ]);
  const failed = results.some((result) => result.status === "rejected" || result.value.error);
  if (failed) throw new Error("Unable to restore preferred language segments");
}

export async function syncPreferredLanguageSegment(resend: Resend, email: string, locale: Locale) {
  const targetId = getPreferredLanguageSegmentId(locale);
  const current = await resend.contacts.segments.list({ email, limit: 100 });
  if (current.error) throw new Error(`Unable to read contact segments: ${current.error.name}`);

  const currentLanguageIds = current.data?.data
    .map(({ id }) => id)
    .filter((id) => languageSegmentIds.has(id)) ?? [];

  const targetWasAdded = !currentLanguageIds.includes(targetId);
  let targetAdded = false;
  const previousLanguageIds = currentLanguageIds.filter((segmentId) => segmentId !== targetId);
  const removedLanguageIds: string[] = [];

  try {
    if (targetWasAdded) {
      const added = await resend.contacts.segments.add({ email, segmentId: targetId });
      if (added.error) throw new Error(`Unable to add preferred language segment: ${added.error.name}`);
      targetAdded = true;
    }

    for (const segmentId of previousLanguageIds) {
      const removed = await resend.contacts.segments.remove({ email, segmentId });
      if (removed.error) throw new Error(`Unable to remove previous language segment: ${removed.error.name}`);
      removedLanguageIds.push(segmentId);
    }
  } catch (error) {
    await restorePreferredLanguageSegments(resend, email, removedLanguageIds, targetAdded, targetId).catch(() => undefined);
    throw error;
  }

  return (() => restorePreferredLanguageSegments(resend, email, previousLanguageIds, targetWasAdded, targetId)) satisfies SegmentRollback;
}
