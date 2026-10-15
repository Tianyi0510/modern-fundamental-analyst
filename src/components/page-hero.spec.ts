import { expect, test } from "@playwright/test";

test("narrow English heroes keep ordinary words intact", { tag: "@mobile" }, async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/contact", "/memos"]) {
      await page.goto(path);
      await page.addStyleTag({ content: "html { overflow-y: scroll; scrollbar-gutter: stable; }" });
      await page.evaluate(() => document.fonts.ready);
      const words = await page.locator("h1").evaluate((heading) => {
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const words: { text: string; lines: number }[] = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (const match of node.textContent!.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const lines = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => rect.y));
            words.push({ text: match[0], lines: lines.size });
          }
        }
        return words;
      });
      expect(words.length).toBeGreaterThan(0);
      for (const word of words) expect(word.lines, `${path} ${word.text} at ${width}px`).toBe(1);
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      const overflow = await page.locator("body").evaluate((body) =>
        [...body.querySelectorAll("*")]
          .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
          .map((element) => ({
            tag: element.tagName,
            className: element.className,
            text: element.textContent?.slice(0, 80),
            right: element.getBoundingClientRect().right,
          }))
          .slice(-15),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        JSON.stringify(overflow),
      ).toBe(true);
    }
  }
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} mobile headings keep phrases together`, { tag: "@mobile" }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/about`);
    await page.evaluate(() => document.fonts.ready);
    if (prefix) {
      const phrase = prefix === "/zh-tw" ? "投資" : "投资";
      const lines = await page.locator("h1 em").evaluate((em, phrase) => {
        const walker = document.createTreeWalker(em, NodeFilter.SHOW_TEXT);
        let node: Node | null = null;
        while (walker.nextNode()) {
          if (walker.currentNode.textContent!.includes(phrase)) {
            node = walker.currentNode;
            break;
          }
        }
        if (!node) return 0;
        const start = node.textContent!.indexOf(phrase);
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + phrase.length);
        return new Set([...range.getClientRects()].map((rect) => rect.y)).size;
      }, phrase);
      expect(lines).toBe(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto(prefix || "/");
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator(".cta h2");
    await expect(heading).toBeVisible();
    if (!prefix) {
      const lines = await heading.evaluate((heading) => {
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const lines: Record<number, string[]> = {};
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (const match of node.textContent!.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const y = Math.round(range.getBoundingClientRect().y);
            (lines[y] ??= []).push(match[0]);
          }
        }
        return Object.values(lines).map((words) => words.join(" "));
      });
      expect(lines).not.toContain("With");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`${prefix || "English"} desktop Contact fields share a column edge`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${prefix}/contact`);
    const edges = await page.locator("main").evaluate((main) => {
      const subscribe = main.querySelector(".subscribe-form input[type=email]")!.getBoundingClientRect();
      const name = main.querySelector('.contact-form input[name="name"]')!.getBoundingClientRect();
      const subject = main.querySelector('.contact-form input[name="subject"]')!.getBoundingClientRect();
      const form = main.querySelector(".contact-form")!.getBoundingClientRect();
      return { subscribe: subscribe.x, name: name.x, subject: subject.x, right: subject.right, formRight: form.right };
    });
    expect(edges.name).toBeCloseTo(edges.subscribe, 1);
    expect(edges.subject).toBeCloseTo(edges.subscribe, 1);
    expect(edges.right).toBeCloseTo(edges.formRight, 1);
  });
}
