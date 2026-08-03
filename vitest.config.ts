import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * No Windows (ex.: Git Bash), `process.cwd()` pode vir com drive em minúsculo (`c:`).
 * Isso duplica o module graph do Vitest e quebra o suite collector com:
 * TypeError: Cannot read properties of undefined (reading 'config')
 * `realpathSync.native` devolve o casing real do filesystem (`C:`).
 */
const configDir = path.dirname(fileURLToPath(import.meta.url));
const root =
  process.platform === "win32"
    ? fs.realpathSync.native(configDir)
    : configDir;

export default defineConfig({
  root,
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/app.ts",
        "src/seed.ts",
        "src/**/*.routes.ts",
        "src/**/*.controller.ts",
        "src/routes/**",
        "src/http/**",
        "src/config/**",
        "src/**/*.repository.ts",
        "src/**/*.service.ts",
        "src/utils/json-database.ts",
        "src/utils/database-type.ts",
        "src/domain/**",
      ],
      reporter: ["text", "text-summary", "html", "lcov"],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 70,
        functions: 70,
      },
    },
  },
});
