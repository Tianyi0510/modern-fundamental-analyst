import { expect, test } from "@playwright/test";

test(
  "browser errors reach the isolated transport without email or URL recovery values",
  { tag: "@mobile" },
  async ({ page }) => {
    test.skip(process.env.PLAYWRIGHT_SENTRY_TEST !== "1", "Requires an explicitly enabled fake DSN");
    let eventBody = "";
    await page.route("https://sentry.invalid/**", async (route) => {
      const body = route.request().postData() ?? "";
      if (body.includes("Sentry regression error")) eventBody = body;
      await route.fulfill({ status: 200, json: {} });
    });
    await page.goto("/contact?token=private-recovery-token");
    await page.evaluate(() => {
      const button = document.createElement("button");
      button.textContent = "Trigger isolated monitoring error";
      button.onclick = () => {
        throw new Error(
          "Sentry regression error reader@example.com https://example.com/support?session_id=private-session",
        );
      };
      document.body.append(button);
    });
    await page.getByRole("button", { name: "Trigger isolated monitoring error", exact: true }).click();
    await expect.poll(() => eventBody).toContain("Sentry regression error");
    for (const value of ["reader@example.com", "private-recovery-token", "private-session"]) {
      expect(eventBody).not.toContain(value);
    }
    await expect(page.getByRole("main")).toBeVisible();
  },
);

test(
  "sampled browser traces reach the isolated transport without recovery query values",
  { tag: "@mobile" },
  async ({ page }) => {
    test.skip(process.env.PLAYWRIGHT_SENTRY_TEST !== "1", "Requires an explicitly enabled fake DSN");
    const spans: { name: string; attributes: Record<string, unknown> }[] = [];
    await page.route("https://sentry.invalid/**", async (route) => {
      const lines = (route.request().postData() ?? "").split("\n");
      for (let index = 1; index + 1 < lines.length; index += 2) {
        if (lines[index]?.includes('"type":"span"')) {
          const payload = JSON.parse(lines[index + 1] ?? "{}") as { items?: typeof spans };
          spans.push(...(payload.items ?? []));
        }
      }
      await route.fulfill({ status: 200, json: {} });
    });
    await page.goto("/contact?token=private-recovery-token");
    await expect.poll(() => spans.some((span) => span.name === "/contact"), { timeout: 20_000 }).toBe(true);
    expect(spans.find((span) => span.name === "/contact")?.attributes["sentry.environment"]).toEqual({
      type: "string",
      value: "test",
    });
    expect(JSON.stringify(spans)).not.toContain("private-recovery-token");
  },
);

test("session replay masks page text and excludes form contents", { tag: "@mobile" }, async ({ page }) => {
  test.skip(process.env.PLAYWRIGHT_SENTRY_TEST !== "1", "Requires an explicitly enabled fake DSN");
  const recordings: string[] = [];
  await page.route("https://sentry.invalid/**", async (route) => {
    const body = route.request().postData() ?? "";
    if (body.includes('"type":"replay_recording"')) recordings.push(body);
    await route.fulfill({ status: 200, json: {} });
  });
  await page.goto("/contact");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Replay Private Name");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("replay-private@example.com");
  await expect.poll(() => recordings.length, { timeout: 20_000 }).toBeGreaterThan(0);
  const payload = recordings.join("\n");
  expect(payload).toContain('"type":"replay_event"');
  expect(payload).not.toContain("Replay Private Name");
  expect(payload).not.toContain("replay-private@example.com");
  expect(payload).not.toContain("Connect Through Research");
  const forms: unknown[] = [];
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if ("tagName" in value && value.tagName === "form") {
      forms.push("childNodes" in value ? value.childNodes : undefined);
    }
    for (const child of Object.values(value)) visit(child);
  }
  for (const line of payload.split("\n")) {
    if (line.startsWith("[")) visit(JSON.parse(line));
  }
  expect(forms.length).toBeGreaterThan(0);
  for (const children of forms) expect(children).toEqual([]);
});
