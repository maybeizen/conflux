import { resolve } from "node:path";

import { isValidEnvKey } from "../env/env-key.js";
import { assertPathInsideRoot } from "../util/path-safety.js";
import type { ConfluxUserConfig, ResolvedConfluxConfig } from "./types.js";

export const CONFIG_FILENAMES = [
  "conflux.config.ts",
  "conflux.config.js",
  "conflux.config.mjs",
  "conflux.config.cjs",
  "conflux.config.mts",
  "conflux.config.cts",
] as const;

export function normalizePrefixList(prefix: string | string[]): string[] {
  const list = Array.isArray(prefix) ? prefix : [prefix];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    if (typeof item !== "string" || item.length === 0 || seen.has(item)) {
      continue;
    }
    seen.add(item);
    unique.push(item);
  }
  unique.sort((a, b) => b.length - a.length || a.localeCompare(b));
  return unique;
}

export function resolvePrefixList(prefix?: string | string[]): string[] {
  if (prefix === undefined) {
    return ["!"];
  }
  const resolved = normalizePrefixList(prefix);
  if (resolved.length === 0) {
    throw new Error("Conflux prefix must be a non-empty string or array of non-empty strings");
  }
  return resolved;
}

export function resolveConfluxConfig(
  config: ConfluxUserConfig,
  root: string,
): ResolvedConfluxConfig {
  const loadRoot = resolve(root);
  const resolvedRoot = resolve(loadRoot, config.root ?? ".");
  assertPathInsideRoot(loadRoot, resolvedRoot, "root");
  if (config.env !== undefined && !isValidEnvKey(config.env)) {
    throw new Error(`Invalid token env var name: ${config.env}`);
  }
  const resolved: ResolvedConfluxConfig = {
    root: resolvedRoot,
    outDir: resolve(resolvedRoot, config.outDir ?? "dist"),
    entry: resolve(resolvedRoot, config.entry ?? "src/index.ts"),
    commandsDir: resolve(resolvedRoot, config.commandsDir ?? "src/commands"),
    eventsDir: resolve(resolvedRoot, config.eventsDir ?? "src/events"),
    token: config.token,
    env: config.env,
    prefix: resolvePrefixList(config.prefix),
    tsdown: config.tsdown,
  };
  assertPathInsideRoot(loadRoot, resolved.outDir, "outDir");
  assertPathInsideRoot(loadRoot, resolved.entry, "entry");
  assertPathInsideRoot(loadRoot, resolved.commandsDir, "commandsDir");
  assertPathInsideRoot(loadRoot, resolved.eventsDir, "eventsDir");
  return resolved;
}
