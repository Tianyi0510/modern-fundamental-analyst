import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluate } from "@mdx-js/mdx";
import { createElement } from "react";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import remarkMemoToc from "../../../scripts/remark-memo-toc.mjs";
import { memoMdxComponents } from "./memo-mdx-components.tsx";

test("memo MDX preserves the verified article text, hierarchy and source references", async () => {
  const source = await readFile(new URL("./articles/microsoft-stock-analysis-fiscal-year-2024.mdx", import.meta.url));
  const { default: Article, memoTableOfContents } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkMemoToc],
  });
  const document = new JSDOM(renderToStaticMarkup(createElement(Article, { components: memoMdxComponents }))).window
    .document;
  const headings = [...document.querySelectorAll("h2, h3")];
  assert.deepEqual(
    memoTableOfContents,
    headings.map((heading) => ({
      id: heading.id,
      title: heading.textContent,
      level: Number(heading.tagName[1]),
    })),
  );
  assert.equal(new Set(headings.map((heading) => heading.id)).size, headings.length);
  assert.ok(headings.every((heading) => !heading.id.startsWith("memo-")));
  assert.equal(
    document.getElementById("framework-for-understanding-business")?.textContent,
    "Framework for understanding business",
  );
  assert.equal(document.getElementById("investment-conclusion-3")?.textContent, "Investment conclusion");
  assert.equal(document.querySelector(".memo-references h2")?.textContent, "References");
  const text = [...document.querySelectorAll("h2,h3,p,li")]
    .map((element) => element.textContent.replace(/\s+/g, " ").trim())
    .join("\n");
  // Original rendered research text, with the approved References heading punctuation update.
  assert.equal(
    createHash("sha256").update(text).digest("hex"),
    "627fe4d7b066ac1d1ba126271a682f06bc17478e7f5099e0d3a60178f0afa78a",
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
