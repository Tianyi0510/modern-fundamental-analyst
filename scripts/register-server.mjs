// Node-only entry points (unit tests and operator CLI). Next.js enforces the
// server-only boundary itself during application builds.
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";
import { registerHooks } from "node:module";
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".tsx")) {
      const source = ts.transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        fileName: new URL(url).pathname,
      }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
    if (specifier.startsWith("@/")) {
      const base = new URL(`../src/${specifier.slice(2)}`, import.meta.url).href;
      return nextResolve(existsSync(new URL(`${base}.ts`)) ? `${base}.ts` : `${base}.tsx`, context);
    }
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier) && context.parentURL) {
      const base = new URL(specifier, context.parentURL).href;
      for (const extension of [".ts", ".tsx"]) {
        if (existsSync(new URL(base + extension))) return nextResolve(base + extension, context);
      }
    }
    return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
  },
});
