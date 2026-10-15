import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { clearContactDraft, readContactDraft, saveContactDraft } from "./contact-draft";

beforeEach(() => {
  const entries = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

const draft = {
  name: "Reader",
  email: "reader@example.com",
  subject: "Research",
  message: "Please explain the portfolio returns.",
  submissionId: "7b08c849-efcb-4d11-90f0-47a83b081b62",
};

it("clears only the completed attempt, retaining newer edits and other languages", () => {
  saveContactDraft("en", draft);
  saveContactDraft("zh-tw", draft);
  saveContactDraft("en", { ...draft, message: "A newer message.", submissionId: undefined });
  clearContactDraft("en", draft.submissionId);
  expect(readContactDraft("en")?.message).toBe("A newer message.");
  clearContactDraft("zh-tw", draft.submissionId);
  expect(readContactDraft("zh-tw")).toBeUndefined();
});

it("rejects malformed or oversized stored drafts instead of restoring unchecked values", () => {
  for (const value of [
    "{",
    "null",
    JSON.stringify({ ...draft, message: "a".repeat(5001) }),
    JSON.stringify({ ...draft, submissionId: "invalid" }),
  ]) {
    sessionStorage.setItem("mfa:contact-draft:v1:en", value);
    expect(readContactDraft("en")).toBeUndefined();
  }
});
