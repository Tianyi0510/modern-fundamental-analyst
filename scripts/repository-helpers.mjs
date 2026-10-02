import { readFile } from "node:fs/promises";

export const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
