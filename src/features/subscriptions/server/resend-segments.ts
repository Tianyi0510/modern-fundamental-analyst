import "server-only";
import { hasProviderId, isResendWriteAcknowledged, isRemovalAcknowledged } from "@/lib/resend-contracts";
import type { Resend } from "resend";
import type { Locale } from "@/lib/i18n";
import { reportResendRollbackFailure, runResendOperation, resendOperationContext } from "@/lib/resend";

const preferredLanguageSegments = {
  en: process.env.RESEND_SEGMENT_EN || "39c96ed5-94c2-4755-876a-b29b414433e0",
  "zh-tw": process.env.RESEND_SEGMENT_ZH_TW || "4e7fa9d7-7df1-42a9-a6d0-224f6a59b982",
  "zh-cn": process.env.RESEND_SEGMENT_ZH_CN || "84cc2bde-6d03-4497-b21b-84c1d4fc265e",
} satisfies Record<Locale, string>;

const languageSegmentIds = new Set(Object.values(preferredLanguageSegments));

export function getPreferredLanguageSegmentId(locale: Locale) {
  return preferredLanguageSegments[locale];
}

function isSegmentPage(value: unknown): value is { data: { id: string }[]; has_more: boolean } {
  return Boolean(
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray(value.data) &&
    value.data.every(hasProviderId) &&
    "has_more" in value &&
    typeof value.has_more === "boolean",
  );
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
    ...segmentIds.map((segmentId) =>
      runResendOperation("Restore language segment failed", () => resend.contacts.segments.add({ email, segmentId })),
    ),
    ...(removeTarget
      ? [
          runResendOperation("Remove target language segment failed", () =>
            resend.contacts.segments.remove({ email, segmentId: targetId }),
          ),
        ]
      : []),
  ]);
  const failed = results.some(
    (result, index) =>
      result.status === "rejected" ||
      !result.value ||
      result.value.error ||
      !isResendWriteAcknowledged(result.value.data, index < segmentIds.length ? hasProviderId : isRemovalAcknowledged),
  );
  if (failed) {
    reportResendRollbackFailure();
    throw new Error("Unable to restore preferred language segments");
  }
}

export async function syncPreferredLanguageSegment(resend: Resend, email: string, locale: Locale) {
  const targetId = getPreferredLanguageSegmentId(locale);
  const found = new Set<string>();
  const cursors = new Set<string>();
  let after: string | undefined;
  // Read the entire snapshot before any mutation. Bound malformed pagination
  // independently of the shared operation deadline.
  for (let page = 0; ; page += 1) {
    if (page >= 100) throw new Error("Contact segment pagination limit exceeded");
    const current = await runResendOperation("Read contact language segments failed", () =>
      resend.contacts.segments.list({ email, limit: 100, ...(after ? { after } : {}) }),
    );
    if (!current || current.error || !isSegmentPage(current.data)) throw new Error("Unable to read contact segments");
    for (const { id } of current.data.data) if (languageSegmentIds.has(id)) found.add(id);
    if (!current.data.has_more) break;
    after = current.data.data.at(-1)?.id;
    if (!after || cursors.has(after)) throw new Error("Invalid contact segment pagination");
    cursors.add(after);
  }
  const currentLanguageIds = [...found];

  const targetWasAdded = !currentLanguageIds.includes(targetId);
  let targetAdded = false;
  const previousLanguageIds = currentLanguageIds.filter((segmentId) => segmentId !== targetId);
  const removedLanguageIds: string[] = [];

  try {
    if (targetWasAdded) {
      const added = await runResendOperation("Add preferred language segment failed", () =>
        resend.contacts.segments.add({ email, segmentId: targetId }),
      );
      if (!added || added.error || !isResendWriteAcknowledged(added.data))
        throw new Error("Unable to add preferred language segment");
      targetAdded = true;
    }

    const removals = await Promise.allSettled(
      previousLanguageIds.map(async (segmentId) => ({
        segmentId,
        result: await runResendOperation("Remove previous language segment failed", () =>
          resend.contacts.segments.remove({ email, segmentId }),
        ),
      })),
    );
    let removalError: unknown;
    for (const removal of removals) {
      if (removal.status === "rejected") {
        removalError ??= removal.reason;
      } else if (
        !removal.value.result ||
        removal.value.result.error ||
        !isResendWriteAcknowledged(removal.value.result.data, isRemovalAcknowledged)
      ) {
        removalError ??= new Error("Unable to remove previous language segment");
      } else {
        removedLanguageIds.push(removal.value.segmentId);
      }
    }
    if (removalError)
      throw removalError instanceof Error ? removalError : new Error("Unable to remove previous language segment");
  } catch (error) {
    if (resendOperationContext.getStore()?.uncertain) throw error;
    await restorePreferredLanguageSegments(resend, email, removedLanguageIds, targetAdded, targetId).catch(
      () => undefined,
    );
    throw error;
  }

  return (() =>
    restorePreferredLanguageSegments(
      resend,
      email,
      previousLanguageIds,
      targetWasAdded,
      targetId,
    )) satisfies SegmentRollback;
}
