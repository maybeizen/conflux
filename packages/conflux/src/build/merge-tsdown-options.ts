import type { Options } from "tsdown";

import type { ConfluxTsdownOptions } from "../config/types.js";

const RESERVED_TSDOWN_KEYS = [
  "config",
  "configLoader",
  "cwd",
  "entry",
  "filter",
  "outDir",
  "watch",
] as const satisfies readonly (keyof Options)[];

export function mergeTsdownOptions(
  defaults: Options,
  user: ConfluxTsdownOptions | undefined,
  required: Pick<Options, "config" | "cwd" | "entry" | "outDir">,
): Options {
  if (!user) {
    return { ...defaults, ...required };
  }
  const extra = { ...(user as Options) };
  for (const key of RESERVED_TSDOWN_KEYS) {
    delete extra[key];
  }
  return { ...defaults, ...extra, ...required };
}
