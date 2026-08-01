import { spawn } from "node:child_process";

import type { PackageManager } from "./detect-package-manager.js";

const INSTALL_ARGS: Record<PackageManager, { command: string; args: string[] }> = {
  bun: { command: "bun", args: ["install"] },
  pnpm: { command: "pnpm", args: ["install"] },
  yarn: { command: "yarn", args: ["install"] },
  npm: { command: "npm", args: ["install"] },
};

export function runInstall(pm: PackageManager, cwd: string): Promise<void> {
  const { command, args } = INSTALL_ARGS[pm];
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} install failed with exit code ${String(code)}`));
    });
  });
}
