import { spawn } from "node:child_process";

export function runGitInit(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["init"], {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git init failed with exit code ${String(code)}`));
    });
  });
}
