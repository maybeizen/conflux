import { resolveConfluxConfig } from "./defaults.js";
import type { ConfluxUserConfig, ResolvedConfluxConfig } from "./types.js";

export function defineConfig(config: ConfluxUserConfig = {}): ResolvedConfluxConfig {
  const root = config.root ?? process.cwd();
  return resolveConfluxConfig(config, root);
}
