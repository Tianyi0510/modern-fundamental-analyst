import assert from "node:assert/strict";
import test from "node:test";
import { monitoringCapture } from "../../../../scripts/sentry-test-client.mjs";

const { getPreferredLanguageSegmentId, syncPreferredLanguageSegment } = await import("./resend-segments.ts");

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

test("preferred-language segment sync reports a partial failure once and rolls it back", async (t) => {
  const capture = monitoringCapture(t);
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
  await capture.flush();
  assert.equal(capture.events.length, 1);
  assert.equal(capture.logs.length, 1);
  assert.equal(capture.metrics.length, 1);
  assert.doesNotMatch(JSON.stringify(capture), /reader@example.com|SegmentRemovalError/);
});

test("segment sync reads later pages and preserves unrelated memberships", async () => {
  const english = getPreferredLanguageSegmentId("en");
  const target = getPreferredLanguageSegmentId("zh-tw");
  const unrelated = Array.from({ length: 100 }, (_, index) => `other-${index}`);
  const mock = createResendSegmentMock([...unrelated, english]);
  const cursors = [];
  mock.client.contacts.segments.list = async ({ after }) => {
    cursors.push(after);
    return { data: { data: (after ? [english] : unrelated).map((id) => ({ id })), has_more: !after } };
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
    mock.client.contacts.segments.list = async () =>
      ++calls === 1 ? { data: { data: [{ id: "cursor" }], has_more: true } } : brokenPage;
    await assert.rejects(syncPreferredLanguageSegment(mock.client, "reader@example.com", "zh-tw"));
    assert.deepEqual([...mock.segmentIds], [english]);
    assert.equal(calls, 2);
  }
});
