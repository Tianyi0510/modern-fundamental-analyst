import { readFile } from "node:fs/promises";

export const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

// Follow the application's CSS entry point so tests retain its cascade order.
export const readStyles = async () => {
  const entryUrl = new URL("../app/globals.css", import.meta.url);
  const source = await readFile(entryUrl, "utf8");
  const imports = [...source.matchAll(/@import\s+["'](\.[^"']+)["'];/g)];
  const styles = await Promise.all(imports.map((match) => readFile(new URL(match[1], entryUrl), "utf8")));
  let index = 0;
  return source.replace(/@import\s+["'](\.[^"']+)["'];/g, () => styles[index++]);
};
