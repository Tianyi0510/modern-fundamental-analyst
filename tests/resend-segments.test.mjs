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

  const rollback = await syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw");

  assert.deepEqual([...mock.segmentIds], [traditionalChinese]);

  await rollback();
  assert.deepEqual([...mock.segmentIds], [english]);
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

test("segment sync reads later pages and preserves unrelated memberships", async () => {
  const english = getPreferredLanguageSegmentId("en");
  const target = getPreferredLanguageSegmentId("zh-tw");
  const unrelated = Array.from({ length: 100 }, (_, index) => `other-${index}`);
  const mock = createResendSegmentMock([...unrelated, english]);
  const cursors = [];
  mock.client.contacts.segments.list = async ({ after }) => {
    cursors.push(after);
    return { data: { data: (after ? [english] : unrelated).map(id => ({ id })), has_more: !after } };
  };
  await syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw");
  assert.deepEqual(cursors, [undefined, "other-99"]);
  assert.deepEqual([...mock.segmentIds], [...unrelated, target]);
});

test("failed or non-progressing pagination does not mutate segments", async () => {
  for (const brokenPage of [{ error: { name: "failed" } }, { data: { data: [{ id: "cursor" }], has_more: true } }]) {
    const english = getPreferredLanguageSegmentId("en");
    const mock = createResendSegmentMock([english]);
    let calls = 0;
    mock.client.contacts.segments.list = async () => ++calls === 1
      ? { data: { data: [{ id: "cursor" }], has_more: true } }
      : brokenPage;
    await assert.rejects(syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw"));
    assert.deepEqual([...mock.segmentIds], [english]);
    assert.equal(calls, 2);
  }
});
