import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const MODULE_EXTENSIONS = [".ts", ".js", ".mts", ".mjs", ".cjs"] as const;

export function isLoadableModule(name: string): boolean {
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
    if (!entry.isDirectory()) {
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
  if (!existsSync(dir)) {
    return;
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !isLoadableModule(entry.name)) {
      continue;
    }
    await import(pathToFileURL(join(dir, entry.name)).href);
  }
}
