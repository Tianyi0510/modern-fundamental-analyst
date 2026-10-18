import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluate } from "@mdx-js/mdx";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { memoMdxComponents } from "./memo-mdx-components.tsx";

test("memo MDX preserves the verified article text, hierarchy and source references", async () => {
  const source = await readFile(new URL("./articles/microsoft-stock-analysis-fiscal-year-2024.mdx", import.meta.url));
  const { default: Article } = await evaluate(source, { ...runtime });
  const document = new JSDOM(renderToStaticMarkup(createElement(Article, { components: memoMdxComponents }))).window
    .document;
  const text = [...document.querySelectorAll("h2,h3,p,li")]
    .map((element) => element.textContent.replace(/\s+/g, " ").trim())
    .join("\n");
  // Recorded from the rendered article before migrating its source format.
  assert.equal(
    createHash("sha256").update(text).digest("hex"),
    "e03de3a955c39c9ac9e933b2be2484af41117e64c49724108db2b6eff3c76912",
  );
  assert.equal(document.querySelectorAll(".memo-section").length, 3);
  assert.equal(document.querySelectorAll("p").length, 40);
  assert.equal(
    [...document.querySelectorAll("h3")].filter((heading) => heading.textContent === "Investment conclusion").length,
    3,
  );
  assert.match(text, /Satya Nadella’s ethical leadership is a masterclass/);
  assert.match(text, /Microsoft‘s retained earnings surged from \$24\.2 billion/);
  assert.deepEqual(
    [...document.querySelectorAll(".memo-references a")].map((link) => link.href),
    [
      "https://www.forbes.com/sites/petercohan/2024/02/13/why-microsoft-azure-could-take-the-cloud-lead-from-amazon-aws-by-2026/",
      "https://tei.forrester.com/go/microsoft/fabric/",
      "https://brandfinance.com/press-releases/microsoft-chief-satya-nadella-leads-2025-list-of-top-100-ceos-elon-musk-vaults-to-6th-place-from-19th",
      "https://www.microsoft.com/investor/reports/ar24/index.html",
      "https://www.berkshirehathaway.com/letters/1987.html",
    ],
  );
});
