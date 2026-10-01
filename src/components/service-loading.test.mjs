import assert from "node:assert/strict";
import { Writable } from "node:stream";
import test from "node:test";
import { createElement, Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";

import { ServiceLoading } from "./service-loading.tsx";

for (const [locale, label] of [
  ["en", "Loading…"],
  ["zh-tw", "載入中…"],
  ["zh-cn", "加载中…"],
]) {
  test(`${locale} Suspense streams accessible loading feedback before service completion`, async () => {
    let ready = false;
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    function DeferredContent() {
      if (!ready) throw pending;
      return createElement("p", null, "Resolved service content");
    }
    let output = "";
    let shellReady;
    let finished;
    const shell = new Promise((resolve) => {
      shellReady = resolve;
    });
    const completion = new Promise((resolve) => {
      finished = resolve;
    });
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    destination.on("finish", finished);
    const stream = renderToPipeableStream(
      createElement(
        "div",
        null,
        createElement("h1", null, "Page hero"),
        createElement(
          Suspense,
          { fallback: createElement(ServiceLoading, { locale }) },
          createElement(DeferredContent),
        ),
        createElement("footer", null, "Footer"),
      ),
      {
        onShellReady() {
          stream.pipe(destination);
          shellReady();
        },
      },
    );
    try {
      await shell;
      assert.match(output, /Page hero/);
      assert.match(output, /Footer/);
      assert.match(output, /role="status"/);
      assert.match(output, /aria-busy="true"/);
      assert.ok(output.includes(label));
      assert.ok(!output.includes("Resolved service content"));
      ready = true;
      release();
      await completion;
      assert.ok(output.includes("Resolved service content"));
    } finally {
      stream.abort();
    }
  });
}
