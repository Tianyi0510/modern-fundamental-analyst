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

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} Home reading width and contact action reflow @mobile`, async ({ page }) => {
    await page.goto(prefix || "/");
    await page.evaluate(() => document.fonts.ready);
    for (const width of [390, 801, 834, 1024, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 955 });
      for (const scale of [100, 150, 175, 200]) {
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value + "%";
        }, scale);
        const layout = await page.locator(".home-about").evaluate((section) => {
          const column = section.lastElementChild!;
          const paragraph = column.querySelector("p")!;
          const probe = document.createElement("span");
          probe.style.cssText = "position:absolute;width:80ch;visibility:hidden";
          column.append(probe);
          const measure = probe.getBoundingClientRect().width;
          probe.remove();
          const outer = section.getBoundingClientRect();
          const gap = parseFloat(getComputedStyle(section).columnGap);
          const heading = document.querySelector(".cta h2")!;
          const action = document.querySelector(".cta a")!;
          const range = document.createRange();
          range.selectNodeContents(action);
          const actionLines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.y))).size;
          const lines = new Map<number, string[]>();
          const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            for (const match of node.textContent!.matchAll(/\S+/g)) {
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              const y = Math.round(range.getBoundingClientRect().top);
              lines.set(y, [...(lines.get(y) ?? []), match[0]]);
            }
          }
          return {
            left: column.getBoundingClientRect().left - outer.left,
            column: column.getBoundingClientRect().width,
            full: outer.width,
            seven: ((outer.width + gap) * 7) / 12 - gap,
            paragraph: paragraph.getBoundingClientRect().width,
            measure,
            stacked: action.getBoundingClientRect().top >= heading.getBoundingClientRect().bottom,
            actionLines,
            headingLines: [...lines.values()].map((words) => words.join(" ").toLowerCase()),
          };
        });
        expect(layout.left).toBeCloseTo(0, 0);
        expect(layout.column).toBeCloseTo(width > 1100 ? layout.seven : layout.full, 0);
        expect(layout.paragraph).toBeCloseTo(Math.min(layout.measure, layout.column), 0);
        expect(layout.stacked).toBe(width <= 800 || layout.full < 42 * 16 * (scale / 100));
        expect(layout.actionLines).toBe(1);
        if (!prefix) expect(layout.headingLines).not.toContain("with");
      }
    }
  });
}
