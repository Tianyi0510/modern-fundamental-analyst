import { expect, test } from "@playwright/test";

test("browser errors reach the isolated transport without email or URL recovery values", async ({ page }) => {
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
});

test("sampled browser traces reach the isolated transport without recovery query values", async ({ page }) => {
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
  expect(JSON.stringify(spans)).not.toContain("private-recovery-token");
});
