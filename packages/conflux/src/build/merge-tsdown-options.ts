import type { InlineConfig } from "tsdown";

import type { ConfluxTsdownOptions } from "../config/types.js";

const RESERVED_TSDOWN_KEYS = [
  "config",
  "configLoader",
  "cwd",
  "entry",
  "filter",
  "outDir",
  "watch",
] as const satisfies readonly (keyof InlineConfig)[];

export function mergeTsdownOptions(
  defaults: InlineConfig,
  user: ConfluxTsdownOptions | undefined,
  required: Pick<InlineConfig, "config" | "cwd" | "entry" | "outDir">,
): InlineConfig {
  if (!user) {
    return { ...defaults, ...required };
  }
  const extra = { ...(user as InlineConfig) };
  for (const key of RESERVED_TSDOWN_KEYS) {
    delete extra[key];
  }
  return { ...defaults, ...extra, ...required };
}
