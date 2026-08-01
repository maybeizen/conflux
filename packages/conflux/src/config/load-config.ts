import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { CONFIG_FILENAMES, resolveConfluxConfig } from "./defaults.js";
import type { ConfluxUserConfig, ResolvedConfluxConfig } from "./types.js";

function isResolvedConfig(value: unknown): value is ResolvedConfluxConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.root === "string" &&
    typeof record.entry === "string" &&
    typeof record.outDir === "string"
  );
}

export function findConfigPath(root: string): string | null {
  for (const name of CONFIG_FILENAMES) {
    const path = join(root, name);
    if (existsSync(path)) {
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
  if (typeof exported === "function") {
    const result = await exported();
    if (isResolvedConfig(result)) {
      return result;
    }
    return resolveConfluxConfig(result as ConfluxUserConfig, root);
  }
  if (isResolvedConfig(exported)) {
    return exported;
  }
  return resolveConfluxConfig(exported as ConfluxUserConfig, root);
}
