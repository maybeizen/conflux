import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { CONFIG_FILENAMES, resolveConfluxConfig } from "./defaults.js";
import type { ConfluxUserConfig, ResolvedConfluxConfig } from "./types.js";

function isPlainConfigObject(value: unknown): value is ConfluxUserConfig {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isConfigFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function findConfigPath(root: string): string | null {
  for (const name of CONFIG_FILENAMES) {
    const path = join(root, name);
    if (existsSync(path) && isConfigFile(path)) {
      return path;
    }
  }
  return null;
}

export async function loadConfluxConfig(root: string): Promise<ResolvedConfluxConfig> {
  const configPath = findConfigPath(root);
  if (!configPath) {
    return resolveConfluxConfig({}, root);
  }
  const imported = await import(pathToFileURL(configPath).href);
  const exported = imported.default ?? imported;
  const raw = typeof exported === "function" ? await exported() : exported;
  if (raw === undefined) {
    return resolveConfluxConfig({}, root);
  }
  if (!isPlainConfigObject(raw)) {
    throw new Error(`Conflux config must export an object: ${configPath}`);
  }
  return resolveConfluxConfig(raw, root);
}
