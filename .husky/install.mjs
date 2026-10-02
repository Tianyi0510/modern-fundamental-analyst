import { existsSync } from "node:fs";
import process from "node:process";

// Hooks are local tooling; installs on CI, Vercel and production must not depend on them.
if (
  !process.env.CI &&
  !process.env.VERCEL &&
  process.env.NODE_ENV !== "production" &&
  process.env.HUSKY !== "0" &&
  existsSync(".git")
) {
  const { default: husky } = await import("husky");
  const error = husky();
  if (error) throw new Error(error);
}
