import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

/**
 * Git Bash no Windows inicia Node com drive em minúsculo (`c:`).
 * Isso faz o Vitest carregar o mesmo pacote via `file:///c:/...` e `file:///C:/...`,
 * duplicando o module graph e quebrando o suite collector:
 * TypeError: Cannot read properties of undefined (reading 'config')
 *
 * Estratégia: se o path deste script não está no casing nativo, relança o Node
 * a partir do path real do filesystem antes de executar o Vitest.
 */
function nativePath(filePath) {
  return fs.realpathSync.native(filePath);
}

const scriptPath = fileURLToPath(import.meta.url);
const nativeScriptPath = nativePath(scriptPath);
const nativeCwd = nativePath(process.cwd());

if (
  process.platform === "win32" &&
  (scriptPath !== nativeScriptPath || process.cwd() !== nativeCwd)
) {
  const result = spawnSync(
    process.execPath,
    [nativeScriptPath, ...process.argv.slice(2)],
    {
      cwd: nativeCwd,
      stdio: "inherit",
      env: process.env,
    },
  );
  process.exit(result.status ?? 1);
}

const require = createRequire(import.meta.url);
const vitestCli = nativePath(
  path.join(
    path.dirname(require.resolve("vitest/package.json")),
    "vitest.mjs",
  ),
);

const result = spawnSync(
  process.execPath,
  [vitestCli, ...process.argv.slice(2)],
  {
    cwd: nativeCwd,
    stdio: "inherit",
    env: process.env,
  },
);

process.exit(result.status ?? 1);
