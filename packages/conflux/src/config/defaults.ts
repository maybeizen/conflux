import { resolve } from "node:path";

import type { ConfluxUserConfig, ResolvedConfluxConfig } from "./types.js";

export const CONFIG_FILENAMES = [
  "conflux.config.ts",
  "conflux.config.js",
  "conflux.config.mjs",
  "conflux.config.cjs",
  "conflux.config.mts",
  "conflux.config.cts",
] as const;

export function resolvePrefixList(prefix?: string | string[]): string[] {
  if (prefix === undefined) {
    return ["!"];
  }
  return Array.isArray(prefix) ? prefix : [prefix];
}

export function resolveConfluxConfig(
  config: ConfluxUserConfig,
  root: string,
): ResolvedConfluxConfig {
  const resolvedRoot = resolve(root, config.root ?? ".");
  return {
    root: resolvedRoot,
    outDir: resolve(resolvedRoot, config.outDir ?? "dist"),
    entry: resolve(resolvedRoot, config.entry ?? "src/index.ts"),
    commandsDir: resolve(resolvedRoot, config.commandsDir ?? "src/commands"),
    eventsDir: resolve(resolvedRoot, config.eventsDir ?? "src/events"),
    token: config.token,
    env: config.env,
    prefix: resolvePrefixList(config.prefix),
  };
}
