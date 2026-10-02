import assert from "node:assert/strict";
import test from "node:test";
import { getFormText } from "./form-data.ts";

test("text request fields retain their value while missing fields and files cannot become payload objects", () => {
  const data = new FormData();
  data.set("message", "  Keep spaces and\nnewlines.  ");
  data.set("file", new File(["content"], "probe.txt"));
  assert.equal(getFormText(data, "message"), "  Keep spaces and\nnewlines.  ");
  assert.equal(getFormText(data, "missing"), "");
  assert.equal(getFormText(data, "file"), "");
});
