import { existsSync } from "node:fs";

import type { ResolvedConfluxConfig } from "../config/types.js";
import { sourceDirToOutputDir, sourceModuleToOutputPath } from "./paths.js";

export function resolveBuiltConfig(config: ResolvedConfluxConfig): ResolvedConfluxConfig | null {
  const builtEntry = sourceModuleToOutputPath(config.outDir, config.entry, config.entry);
  if (!existsSync(builtEntry)) {
    return null;
  }
  return {
    ...config,
    entry: builtEntry,
    eventsDir: sourceDirToOutputDir(config.outDir, config.entry, config.eventsDir),
    commandsDir: sourceDirToOutputDir(config.outDir, config.entry, config.commandsDir),
  };
}
