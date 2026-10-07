import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "jsdom",
          environmentOptions: { jsdom: { url: "http://localhost:3210" } },
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./scripts/vitest-setup.ts"],
        },
      },
    ],
  },
});
