import { expect, test } from "@playwright/test";

test("desktop sections share twelve equal tracks and stack at their reading breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, selector, firstSpan] of [
    ["/", ".intro", 8],
    ["/", ".performance-grid", 7],
    ["/about", ".about-section", 5],
    ["/about", ".about-closing", 5],
    ["/contact", ".contact-section", 4],
    ["/portfolio", ".portfolio-holdings-heading", 8],
  ] as const) {
    await page.goto(route);
    const grid = page.locator(selector).first();
    const layout = await grid.evaluate((node) => {
      const style = getComputedStyle(node);
      const tracks = style.gridTemplateColumns.split(" ").map(parseFloat);
      const child = node.querySelector(":scope > h2") ?? node.firstElementChild!;
      return { tracks, gap: parseFloat(style.columnGap), end: getComputedStyle(child).gridColumnEnd };
    });
    expect(layout.tracks).toHaveLength(12);
    expect(Math.max(...layout.tracks) - Math.min(...layout.tracks)).toBeLessThan(0.1);
    expect(layout.gap).toBe(32);
    expect(layout.end).toBe(String(firstSpan + 1));
  }
  await page.goto("/about");
  const closing = page.locator(".about-closing");
  const heading = await closing.locator("h2").boundingBox();
  const copy = await closing.locator(":scope > div").boundingBox();
  expect(copy!.y).toBeCloseTo(heading!.y, 1);
  expect(copy!.width).toBeGreaterThan(heading!.width);
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const columns = await page
      .locator(".about-section")
      .first()
      .evaluate((node) => getComputedStyle(node).gridTemplateColumns);
    expect(columns.split(" ")).toHaveLength(1);
  }
});
