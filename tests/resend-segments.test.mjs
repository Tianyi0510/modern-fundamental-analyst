import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { getPreferredLanguageSegmentId, syncPreferredLanguageSegment } = await import("../lib/resend-segments.ts");

function createResendSegmentMock(initialIds, failRemoveId) {
  const segmentIds = new Set(initialIds);
  return {
    segmentIds,
    client: {
      contacts: {
        segments: {
          async list() {
            return { data: { data: [...segmentIds].map((id) => ({ id })) } };
          },
          async add({ segmentId }) {
            segmentIds.add(segmentId);
            return { data: { id: segmentId } };
          },
          async remove({ segmentId }) {
            if (segmentId === failRemoveId) return { error: { name: "SegmentRemovalError" } };
            segmentIds.delete(segmentId);
            return { data: { id: segmentId } };
          },
        },
      },
    },
  };
}

test("preferred-language segment sync leaves only the selected language", async () => {
  const english = getPreferredLanguageSegmentId("en");
  const traditionalChinese = getPreferredLanguageSegmentId("zh-tw");
  const mock = createResendSegmentMock([english]);

  await syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw");

  assert.deepEqual([...mock.segmentIds], [traditionalChinese]);
});

test("preferred-language segment sync rolls back a partial failure", async () => {
  const english = getPreferredLanguageSegmentId("en");
  const traditionalChinese = getPreferredLanguageSegmentId("zh-tw");
  const simplifiedChinese = getPreferredLanguageSegmentId("zh-cn");
  const mock = createResendSegmentMock([english, simplifiedChinese], simplifiedChinese);

  await assert.rejects(
    syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw"),
    /Unable to remove previous language segment/,
  );

  assert.equal(mock.segmentIds.has(english), true);
  assert.equal(mock.segmentIds.has(simplifiedChinese), true);
  assert.equal(mock.segmentIds.has(traditionalChinese), false);
});
