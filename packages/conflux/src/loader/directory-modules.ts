import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { shouldSkipDirectory } from "./skip-dirs.js";

const MODULE_EXTENSIONS = [".cts", ".cjs", ".mts", ".mjs", ".ts", ".js"] as const;
const DECLARATION_MODULE = /\.d\.(ts|mts|cts)$/i;

export function isLoadableModule(name: string): boolean {
  if (name.startsWith(".") || DECLARATION_MODULE.test(name)) {
    return false;
  }
  return MODULE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function collectDirectoryModulePaths(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !isLoadableModule(entry.name)) {
      continue;
    }
    paths.push(join(dir, entry.name));
  }
  return paths;
}

export function collectEventDirectoryModulePaths(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const paths: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || shouldSkipDirectory(entry.name)) {
      continue;
    }
    const eventDir = join(dir, entry.name);
    const files = readdirSync(eventDir, { withFileTypes: true })
      .filter((file) => file.isFile() && isLoadableModule(file.name))
      .map((file) => file.name)
      .sort((a, b) => a.localeCompare(b));
    for (const file of files) {
      paths.push(join(eventDir, file));
    }
  }
  return paths;
}

export async function loadDirectoryModules(dir: string): Promise<void> {
  const paths = collectDirectoryModulePaths(dir);
  await Promise.all(paths.map((filePath) => import(pathToFileURL(filePath).href)));
}
