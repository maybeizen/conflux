import { join } from "node:path";

export const CONFLUX_DEV_OUT_DIR = ".conflux";

export function resolveDevOutDir(projectRoot: string): string {
  return join(projectRoot, CONFLUX_DEV_OUT_DIR);
}
