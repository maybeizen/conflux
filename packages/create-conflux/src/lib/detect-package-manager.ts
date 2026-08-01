import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { join } from "node:path";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

function fileExists(path: string): boolean {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function commandOnPath(command: string): boolean {
  const probe = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(probe, [command], { stdio: "ignore" });
  return result.status === 0;
}

function detectFromUserAgent(): PackageManager | undefined {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.includes("pnpm")) return "pnpm";
  if (ua.includes("yarn")) return "yarn";
  if (ua.includes("bun")) return "bun";
  if (ua.includes("npm")) return "npm";
  return undefined;
}

function detectFromLockfiles(cwd: string): PackageManager | undefined {
  if (fileExists(join(cwd, "bun.lock")) || fileExists(join(cwd, "bun.lockb"))) {
    return "bun";
  }
  if (fileExists(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fileExists(join(cwd, "yarn.lock"))) return "yarn";
  if (fileExists(join(cwd, "package-lock.json"))) return "npm";
  return undefined;
}

function detectFromPath(): PackageManager | undefined {
  const order: PackageManager[] = ["bun", "pnpm", "yarn", "npm"];
  for (const pm of order) {
    if (commandOnPath(pm)) return pm;
  }
  return undefined;
}

export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
  return detectFromUserAgent() ?? detectFromLockfiles(cwd) ?? detectFromPath() ?? "npm";
}

export function packageManagerRunCommand(pm: PackageManager): string {
  return `${pm} run dev`;
}
