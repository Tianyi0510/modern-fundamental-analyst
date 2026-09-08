// Node-only entry points (unit tests and operator CLI). Next.js enforces the
// server-only boundary itself during application builds.
import { registerHooks } from "node:module";
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
  if (specifier.startsWith("@/")) return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
  return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
} });
